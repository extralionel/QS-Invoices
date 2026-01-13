import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import { authenticate } from "../shopify.server";

import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getInvoiceConfiguration, updateInvoiceConfiguration } from "../services/invoice.server";
import { getShopId } from "../services/shopifyGraphApi.server";
import { PhotoIcon, PencilIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PDFViewer } from "@react-pdf/renderer";
import { InvoiceTemplate, type InvoiceData } from "../components/invoices/InvoiceTemplate";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // We need to authenticate to ensure the request is valid, 
    // but getShopId also authenticates, so we effectively use it for both.
    const shopId = await getShopId(request);

    try {
        const settings = await getInvoiceConfiguration(shopId);
        return settings;
    } catch (error) {
        console.error("Failed to fetch settings:", error);
        return {
            shopName: "",
            companyName: "",
            taxNumber: "",
            registerNumber: "",
            address: "",
            email: "",
            phoneNumber: "",
            imageId: null,
        };
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const shopId = await getShopId(request);

    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Construct payload matching InvoiceConfiguration interface
    const payload = {
        shopName: String(data.shopName || ""),
        companyName: String(data.companyName || ""),
        taxNumber: String(data.taxNumber || ""),
        registerNumber: String(data.registerNumber || ""),
        address: String(data.address || ""),
        email: String(data.email || ""),
        phoneNumber: String(data.phoneNumber || ""),
        imageId: data.imageId ? Number(data.imageId) : null,
    };

    try {
        await updateInvoiceConfiguration(shopId, payload);
        return { success: true };
    } catch (error) {
        console.error("Save settings error:", error);
        return { error: "Failed to save settings" };
    }
};

export default function Settings() {
    const settings = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const submit = useSubmit();

    const [formState, setFormState] = useState(settings || {});
    const [isEditing, setIsEditing] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const isLoading = nav.state === "submitting";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (actionData?.success) {
            shopify.toast.show("Settings saved successfully");
            setIsEditing(false); // Exit edit mode on success
        } else if (actionData?.error) {
            shopify.toast.show(actionData.error);
        }
    }, [actionData, shopify]);

    // Update state when loader data changes
    useEffect(() => {
        if (settings) {
            setFormState(prev => ({ ...prev, ...settings }));
        }
    }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setFormState(settings || {}); // Reset to original
        setIsEditing(false);
    };

    // Construct preview data
    const previewData: InvoiceData = {
        number: "INV-001",
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        status: "PAID",
        currencySymbol: "$",
        company: {
            name: formState.shopName || "My Awesome Shop",
            legalName: formState.companyName || "My Company LLC",
            address: formState.address ? formState.address.split('\n') : ["123 Business St", "City, Country"],
            email: formState.email || "contact@example.com",
            phone: formState.phoneNumber,
        },
        customer: {
            name: "John Doe",
            email: "john@example.com",
            billingAddress: ["456 Customer Ave", "Suite 100", "New York, NY 10001", "United States"],
            shippingAddress: ["456 Customer Ave", "Suite 100", "New York, NY 10001", "United States"],
        },
        items: [
            {
                description: "Premium Widget",
                descriptionDetail: "Size: Large, Color: Blue",
                quantity: 2,
                price: 49.99,
                total: 99.98,
                image: undefined
            },
            {
                description: "Basic Service",
                quantity: 1,
                price: 25.00,
                total: 25.00
            }
        ],
        subtotal: 124.98,
        tax: 12.50,
        shipping: 10.00,
        total: 147.48
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Settings</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage your invoice and company details.</p>
                </div>
                <div className="flex gap-3">
                    {!isEditing ? (
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit Settings
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                            >
                                <XMarkIcon className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="settings-form"
                                disabled={isLoading}
                                className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <CheckIcon className="h-4 w-4" />
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 md:p-8">
                        <Form id="settings-form" method="post" encType="multipart/form-data" className="space-y-8">
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">General Information</h2>
                                <div className="grid grid-cols-1 gap-y-6">
                                    {/* Shop Name */}
                                    <div>
                                        <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                                        <input
                                            type="text"
                                            name="shopName"
                                            id="shopName"
                                            placeholder="My Awesome Shop"
                                            value={formState.shopName || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                                        />
                                    </div>

                                    {/* Company Name */}
                                    <div>
                                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            id="companyName"
                                            placeholder="My Company LLC"
                                            value={formState.companyName || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">Invoice Details</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                    {/* Tax Number */}
                                    <div>
                                        <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-1">Tax / VAT Number</label>
                                        <input
                                            type="text"
                                            name="taxNumber"
                                            id="taxNumber"
                                            placeholder="VAT-123456"
                                            value={formState.taxNumber || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                                        />
                                    </div>

                                    {/* Register Number */}
                                    <div>
                                        <label htmlFor="registerNumber" className="block text-sm font-medium text-gray-700 mb-1">Register Number</label>
                                        <input
                                            type="text"
                                            name="registerNumber"
                                            id="registerNumber"
                                            placeholder="REG-98765"
                                            value={formState.registerNumber || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                                        />
                                    </div>

                                    {/* Phone Number */}
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phoneNumber"
                                            id="phoneNumber"
                                            placeholder="+1 234 567 890"
                                            value={formState.phoneNumber || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Billing Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            id="email"
                                            placeholder="billing@company.com"
                                            value={formState.email || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="col-span-1 md:col-span-2">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Formatted Address</label>
                                        <textarea
                                            name="address"
                                            id="address"
                                            rows={3}
                                            placeholder="123 Business St&#10;City, Country"
                                            value={formState.address || ""}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 transition-colors resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">Branding</h2>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl transition-colors ${isEditing ? 'hover:bg-gray-50 hover:border-gray-300 cursor-pointer bg-white' : 'bg-gray-50 border-gray-200'}`}>
                                        <div className="space-y-2 text-center">
                                            {formState.imageId ? (
                                                <div className="relative group">
                                                    <div className="mx-auto h-24 w-24 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-2">
                                                        {/* Placeholder until we have dynamic image serving */}
                                                        <PhotoIcon className="h-10 w-10 text-gray-400" />
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-2 font-mono">ID: {formState.imageId}</p>
                                                </div>
                                            ) : (
                                                <div className="mx-auto h-12 w-12 text-gray-300">
                                                    <PhotoIcon className="h-full w-full" />
                                                </div>
                                            )}

                                            {isEditing && (
                                                <div className="flex text-sm text-gray-600 justify-center flex-col items-center">
                                                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-black hover:text-gray-700 focus-within:outline-none">
                                                        <span>Upload a new logo</span>
                                                        <input id="file-upload" name="image" type="file" className="sr-only" accept="image/*" />
                                                    </label>
                                                    <p className="pl-1 mt-1">or drag and drop</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-gray-400">
                                                PNG, JPG up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hidden input for imageId to persist it if not changed */}
                            <input type="hidden" name="imageId" value={formState.imageId || ""} />
                        </Form>
                    </div>
                </div>

                {/* Right Column: Preview */}
                <div className="sticky top-6 h-[calc(100vh-6rem)]">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h3 className="font-medium text-gray-900">Live Preview</h3>
                            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">A4 Layout</span>
                        </div>
                        <div className="flex-1 bg-gray-100 p-4 flex items-center justify-center overflow-hidden">
                            {isMounted ? (
                                <PDFViewer className="w-full h-full rounded-lg shadow-lg" showToolbar={false}>
                                    <InvoiceTemplate data={previewData} />
                                </PDFViewer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <span className="animate-pulse">Loading Preview...</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
