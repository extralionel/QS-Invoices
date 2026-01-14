import { type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { authenticate } from "../shopify.server";
import { Card } from "../components/Card";
import { useState, useMemo, useEffect } from "react";
import { EyeIcon, ArrowDownTrayIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon, CloudArrowUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAppBridge } from "@shopify/app-bridge-react";
import { pdf } from "@react-pdf/renderer";
import { InvoiceTemplate } from "../components/invoices/InvoiceTemplate";
import { getOrders, getShopId } from "app/services/shopifyGraphApi.server";
import { getInvoiceConfiguration, getInvoiceTranslations } from "app/services/invoice.server";
import { DEFAULT_TRANSLATIONS, type InvoiceData } from "app/services/invoice.shared";
import JSZip from "jszip";

interface MappedOrder {
    id: string;
    customer: string;
    date: string;
    amount: string;
    status: string;
    originalOrder: any;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await authenticate.admin(request);
    const { shop, orders: ordersData } = await getOrders(request);

    // console.log("shop object: ", shop);
    const shopId = await getShopId(request);
    const invoiceConfig = await getInvoiceConfiguration(shopId);
    const invoiceTranslations = await getInvoiceTranslations(shopId);

    const mappedOrders: MappedOrder[] = ordersData.map((order: any) => ({
        id: order.name,
        customer: order.customer?.displayName || 'Unknown',
        date: new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        amount: `${order.totalPriceSet.shopMoney.currencyCode} ${order.totalPriceSet.shopMoney.amount}`,
        status: order.displayFulfillmentStatus,
        originalOrder: order // Keep the full order object for export
    }));

    return {
        orders: mappedOrders,
        shop,
        invoiceConfig,
        invoiceTranslations,
        page: 1,
        totalPages: 1,
        totalOrders: mappedOrders.length,
        indexOfFirstItem: 0,
        indexOfLastItem: mappedOrders.length
    };
};

export default function Orders() {
    const { orders, shop, invoiceConfig, invoiceTranslations, page, totalPages, totalOrders, indexOfFirstItem, indexOfLastItem } = useLoaderData<typeof loader>();
    const shopify = useAppBridge();
    const navigate = useNavigate();

    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [actionLoading, setActionLoading] = useState<{ orderId: string, action: 'view' | 'download' | 'edit' } | null>(null);

    // Modal States
    const [viewInvoiceState, setViewInvoiceState] = useState<{ isOpen: boolean; orderId: string | null; url: string | null; data: InvoiceData | null }>({
        isOpen: false,
        orderId: null,
        url: null,
        data: null
    });

    const [editInvoiceState, setEditInvoiceState] = useState<{ isOpen: boolean; orderId: string | null; data: InvoiceData | null }>({
        isOpen: false,
        orderId: null,
        data: null
    });

    // Helper to cleanup Blob URLs
    useEffect(() => {
        return () => {
            if (viewInvoiceState.url) URL.revokeObjectURL(viewInvoiceState.url);
        };
    }, [viewInvoiceState.url]);


    // Invoice Data Generation Logic
    const generateInvoiceData = (orderId: string, overrides?: Partial<InvoiceData>): InvoiceData | null => {
        // Find by mapped ID (which is order.name like #1001)
        const mappedOrder = orders.find(o => o.id === orderId);
        if (!mappedOrder) return null;

        const selectedOrder = mappedOrder.originalOrder;

        const currencyCode = selectedOrder.totalPriceSet.shopMoney.currencyCode;
        const currencySymbol = new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }).formatToParts(0).find(part => part.type === 'currency')?.value || currencyCode;

        const baseData: InvoiceData = {
            number: selectedOrder.name.replace('#', ''),
            date: new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            dueDate: new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
            status: selectedOrder.displayFinancialStatus,
            company: {
                name: invoiceConfig.shopName || shop.name,
                legalName: invoiceConfig.companyName || shop.name,
                address: [
                    invoiceConfig.address,
                    invoiceConfig.phoneNumber,
                    invoiceConfig.taxNumber ? `Tax ID: ${invoiceConfig.taxNumber}` : '',
                    invoiceConfig.registerNumber ? `Reg No: ${invoiceConfig.registerNumber}` : '',
                ].filter(Boolean) as string[],
                email: invoiceConfig.email || shop.email,
            },
            customer: {
                name: selectedOrder.customer?.displayName || 'Guest',
                email: selectedOrder.customer?.email || selectedOrder.email || '',
                phone: selectedOrder.customer?.phone || '',
                billingAddress: selectedOrder.billingAddress ? [
                    selectedOrder.billingAddress.address1,
                    selectedOrder.billingAddress.address2,
                    `${selectedOrder.billingAddress.city}, ${selectedOrder.billingAddress.province} ${selectedOrder.billingAddress.zip}`,
                    selectedOrder.billingAddress.country
                ].filter(Boolean) as string[] : [],
                shippingAddress: selectedOrder.shippingAddress ? [
                    selectedOrder.shippingAddress.address1,
                    selectedOrder.shippingAddress.address2,
                    `${selectedOrder.shippingAddress.city}, ${selectedOrder.shippingAddress.province} ${selectedOrder.shippingAddress.zip}`,
                    selectedOrder.shippingAddress.country
                ].filter(Boolean) as string[] : [],
            },
            items: selectedOrder.lineItems.edges.map((edge: any) => ({
                description: edge.node.title,
                descriptionDetail: edge.node.variantTitle !== 'Default Title' ? edge.node.variantTitle : '',
                quantity: edge.node.quantity,
                price: parseFloat(edge.node.originalUnitPriceSet.shopMoney.amount),
                total: parseFloat(edge.node.originalUnitPriceSet.shopMoney.amount) * edge.node.quantity,
                image: edge.node.image?.url
            })),
            subtotal: parseFloat(selectedOrder.currentSubtotalPriceSet.shopMoney.amount),
            tax: parseFloat(selectedOrder.totalTaxSet.shopMoney.amount),
            shipping: parseFloat(selectedOrder.totalShippingPriceSet.shopMoney.amount),
            total: parseFloat(selectedOrder.totalPriceSet.shopMoney.amount),
            currencySymbol: currencySymbol,
            translations: invoiceTranslations['en'] || DEFAULT_TRANSLATIONS,
            ...overrides
        };

        return baseData;
    };


    // Actions
    const handleViewInvoice = async (orderId: string) => {
        setActionLoading({ orderId, action: 'view' });
        // Slight delay to allow UI update if processing is too fast, and for UX
        await new Promise(resolve => setTimeout(resolve, 100));

        const data = generateInvoiceData(orderId);
        if (!data) {
            shopify.toast.show("Error loading invoice data");
            setActionLoading(null);
            return;
        }

        try {
            const blob = await pdf(<InvoiceTemplate data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            setViewInvoiceState({ isOpen: true, orderId, url, data });
        } catch (e) {
            console.error(e);
            shopify.toast.show("Error generating preview");
        } finally {
            setActionLoading(null);
        }
    };

    const handleEditInvoice = async (orderId: string) => {
        setActionLoading({ orderId, action: 'edit' });
        await new Promise(resolve => setTimeout(resolve, 100)); // UX delay

        const data = generateInvoiceData(orderId);
        if (data) {
            setEditInvoiceState({ isOpen: true, orderId, data });
        }
        setActionLoading(null);
    };

    const handleDownloadSingle = async (orderId: string, dataOverride?: InvoiceData) => {
        if (!dataOverride) {
            setActionLoading({ orderId, action: 'download' });
        }

        const data = dataOverride || generateInvoiceData(orderId);
        if (!data) {
            setActionLoading(null);
            return;
        }

        try {
            const blob = await pdf(<InvoiceTemplate data={data} />).toBlob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Invoice-${data.number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            shopify.toast.show("Invoice downloaded");
        } catch (e) {
            console.error(e);
            shopify.toast.show("Download failed");
        } finally {
            if (!dataOverride) {
                setActionLoading(null);
            }
        }
    };


    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            const allIds = orders.map(o => o.id);
            setSelectedOrders(allIds);
            shopify.toast.show(`${allIds.length} orders selected`);
        }
    };

    const toggleSelectOrder = (id: string) => {
        if (selectedOrders.includes(id)) {
            setSelectedOrders(selectedOrders.filter(o => o !== id));
        } else {
            setSelectedOrders([...selectedOrders, id]);
        }
    };

    const handleExport = async () => {
        if (selectedOrders.length === 0) return;
        setIsExporting(true);
        shopify.toast.show(`Generating PDFs for ${selectedOrders.length} orders...`);

        try {
            // Helper purely for the export function's internal loop
            const generateBlobForExport = async (orderId: string) => {
                const data = generateInvoiceData(orderId);
                if (!data) return null;
                return await pdf(<InvoiceTemplate data={data} />).toBlob();
            };

            if (selectedOrders.length > 3) {
                const zip = new JSZip();
                await Promise.all(selectedOrders.map(async (orderId) => {
                    const blob = await generateBlobForExport(orderId);
                    if (blob) {
                        zip.file(`Invoice-${orderId.replace('#', '')}.pdf`, blob);
                    }
                }));
                const content = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
                const url = URL.createObjectURL(content);
                const link = document.createElement('a');
                link.href = url;
                link.download = `Invoices-${new Date().toISOString().slice(0, 10)}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                await Promise.all(selectedOrders.map(async (orderId) => {
                    await handleDownloadSingle(orderId);
                }));
            }
            shopify.toast.show(`Export complete!`);
        } catch (error) {
            console.log('Export failed:', error);
            shopify.toast.show('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDriveUpload = async () => {
        if (selectedOrders.length === 0) return;
        setIsExporting(true);
        shopify.toast.show(`Preparing to upload ${selectedOrders.length} invoices to Drive...`);
        setTimeout(() => {
            setIsExporting(false);
            shopify.toast.show('Upload to Drive initiated! (Mock)');
        }, 1500);
    };

    const handlePageChange = (newPage: number) => {
        navigate(`?page=${newPage}`);
        setSelectedOrders([]);
    };

    const Spinner = ({ className }: { className?: string }) => (
        <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    const ActionButton = ({ icon: Icon, label, onClick, isLoading }: { icon: any, label: string, onClick?: () => void, isLoading?: boolean }) => (
        <div className="group relative flex items-center justify-center">
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); if (!isLoading) onClick?.(); }}
                disabled={isLoading}
                className={`text-gray-400 hover:text-blue-600 transition-colors p-1 ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {isLoading ? <Spinner className="h-5 w-5 text-blue-600" /> : <Icon className="h-5 w-5" />}
            </button>
            {!isLoading && (
                <span className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
                    {label}
                </span>
            )}
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Orders & Invoices</h1>
                <div className="flex gap-2">
                    {selectedOrders.length > 0 && (
                        <>
                            <button
                                onClick={handleDriveUpload}
                                disabled={isExporting}
                                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <CloudArrowUpIcon className="h-4 w-4" />
                                Save to Drive
                            </button>
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
                            >
                                {isExporting && <Spinner className="-ml-1 mr-2 h-4 w-4 text-gray-700" />}
                                {isExporting ? 'Exporting...' : `Export Selected (${selectedOrders.length})`}
                            </button>
                        </>
                    )}
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer">
                        Create New Invoice
                    </button>
                </div>
            </div>

            <Card padding={false}>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-4">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                        checked={orders.length > 0 && selectedOrders.length === orders.length}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Invoice
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order, index) => (
                                <tr key={order.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                                            checked={selectedOrders.includes(order.id)}
                                            onChange={() => toggleSelectOrder(order.id)}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {order.customer}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {order.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {order.amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'FULFILLED' ? 'bg-green-100 text-green-800' :
                                                ['PARTIALLY_FULFILLED', 'IN_PROGRESS'].includes(order.status) ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-gray-100 text-gray-800'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end gap-2">
                                            <ActionButton
                                                icon={EyeIcon}
                                                label="View Invoice"
                                                onClick={() => handleViewInvoice(order.id)}
                                                isLoading={actionLoading?.orderId === order.id && actionLoading?.action === 'view'}
                                            />
                                            <ActionButton
                                                icon={ArrowDownTrayIcon}
                                                label="Download PDF"
                                                onClick={() => handleDownloadSingle(order.id)}
                                                isLoading={actionLoading?.orderId === order.id && actionLoading?.action === 'download'}
                                            />
                                            <ActionButton
                                                icon={PencilIcon}
                                                label="Edit Invoice"
                                                onClick={() => handleEditInvoice(order.id)}
                                                isLoading={actionLoading?.orderId === order.id && actionLoading?.action === 'edit'}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer */}
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">{Math.min(indexOfLastItem, totalOrders)}</span> of <span className="font-medium">{totalOrders}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => handlePageChange(Math.max(page - 1, 1))}
                            disabled={page === 1}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePageChange(Math.min(page + 1, totalPages))}
                            disabled={page === totalPages}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            <ChevronRightIcon className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>
            </Card>

            {/* View Invoice Modal */}
            {viewInvoiceState.isOpen && viewInvoiceState.url && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Invoice Preview: {viewInvoiceState.data?.number}</h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDownloadSingle(viewInvoiceState.orderId!, viewInvoiceState.data!)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <ArrowDownTrayIcon className="h-4 w-4" />
                                    Download
                                </button>
                                <button
                                    onClick={() => setViewInvoiceState({ ...viewInvoiceState, isOpen: false })}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-gray-100 p-6 overflow-hidden">
                            <iframe
                                src={viewInvoiceState.url}
                                className="w-full h-full rounded-lg shadow-sm bg-white"
                                title="Invoice Preview"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Invoice Modal */}
            {editInvoiceState.isOpen && editInvoiceState.data && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Edit Invoice Details</h2>
                            <button
                                onClick={() => setEditInvoiceState({ ...editInvoiceState, isOpen: false })}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                    <input
                                        type="text"
                                        value={editInvoiceState.data.number}
                                        onChange={(e) => setEditInvoiceState({
                                            ...editInvoiceState,
                                            data: { ...editInvoiceState.data!, number: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                                    <input
                                        type="text"
                                        value={editInvoiceState.data.date}
                                        onChange={(e) => setEditInvoiceState({
                                            ...editInvoiceState,
                                            data: { ...editInvoiceState.data!, date: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="text"
                                        value={editInvoiceState.data.dueDate}
                                        onChange={(e) => setEditInvoiceState({
                                            ...editInvoiceState,
                                            data: { ...editInvoiceState.data!, dueDate: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                                    <input
                                        type="text"
                                        value={editInvoiceState.data.currencySymbol}
                                        onChange={(e) => setEditInvoiceState({
                                            ...editInvoiceState,
                                            data: { ...editInvoiceState.data!, currencySymbol: e.target.value }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Company Details Override</h3>
                                </div>

                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={editInvoiceState.data.company.name}
                                        onChange={(e) => setEditInvoiceState({
                                            ...editInvoiceState,
                                            data: { ...editInvoiceState.data!, company: { ...editInvoiceState.data!.company, name: e.target.value } }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="text"
                                        value={editInvoiceState.data.company.email}
                                        onChange={(e) => setEditInvoiceState({
                                            ...editInvoiceState,
                                            data: { ...editInvoiceState.data!, company: { ...editInvoiceState.data!.company, email: e.target.value } }
                                        })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => setEditInvoiceState({ ...editInvoiceState, isOpen: false })}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (editInvoiceState.data && editInvoiceState.orderId) {
                                        // Generate preview with updated data
                                        try {
                                            const blob = await pdf(<InvoiceTemplate data={editInvoiceState.data} />).toBlob();
                                            const url = URL.createObjectURL(blob);
                                            // Close edit, Open View
                                            setEditInvoiceState({ ...editInvoiceState, isOpen: false });
                                            setViewInvoiceState({ isOpen: true, orderId: editInvoiceState.orderId, url, data: editInvoiceState.data });
                                        } catch (e) {
                                            shopify.toast.show("Error saving preview");
                                        }
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Preview & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
