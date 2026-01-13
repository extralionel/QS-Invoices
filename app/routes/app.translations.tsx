
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData, useNavigation, useSubmit } from "react-router";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getInvoiceTranslations, updateInvoiceTranslations, type InvoiceTranslations } from "../services/invoice.server";
import { getShopId } from "../services/shopifyGraphApi.server";
import { CheckIcon, LanguageIcon, ArrowPathIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export const loader = async ({ request }: LoaderFunctionArgs) => {
    const shopId = await getShopId(request);

    // We fetch the currently saved translations
    // If it's the first time, it might return defaults (English)
    const fetchedTranslations = await getInvoiceTranslations(shopId);

    // Merge fetched translations with PRESETS to ensure we have defaults
    // fetchedTranslations is Record<string, InvoiceTranslations>
    // We want to pass this map to the UI
    return { fetchedTranslations };
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const shopId = await getShopId(request);
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const language = String(data.language);

    // Filter out intent or other non-translation fields if any
    const translationData: InvoiceTranslations = {
        invoiceTitle: String(data.invoiceTitle),
        invoiceNo: String(data.invoiceNo),
        dateIssued: String(data.dateIssued),
        dueDate: String(data.dueDate),
        amount: String(data.amount),
        from: String(data.from),
        billTo: String(data.billTo),
        shipTo: String(data.shipTo),
        product: String(data.product),
        description: String(data.description),
        qty: String(data.qty),
        price: String(data.price),
        total: String(data.total),
        subtotal: String(data.subtotal),
        discount: String(data.discount),
        tax: String(data.tax),
        shipping: String(data.shipping),
        grandTotal: String(data.grandTotal),
        thankYou: String(data.thankYou),
        pageNumber: String(data.pageNumber),
        statusPaid: String(data.statusPaid),
        statusPending: String(data.statusPending),
    };

    const payload: Record<string, InvoiceTranslations> = {
        [language]: translationData
    };

    try {
        await updateInvoiceTranslations(shopId, payload);
        return { success: true, savedLanguage: language, savedData: translationData };
    } catch (error) {
        console.error("Save translations error:", error);
        return { error: "Failed to save translations" };
    }
};

const PRESETS: Record<string, InvoiceTranslations> = {
    en: {
        invoiceTitle: "INVOICE",
        invoiceNo: "INVOICE NO.",
        dateIssued: "DATE ISSUED",
        dueDate: "DUE DATE",
        amount: "AMOUNT",
        from: "FROM",
        billTo: "BILL TO",
        shipTo: "SHIP TO",
        product: "PRODUCT",
        description: "DESCRIPTION",
        qty: "QTY",
        price: "PRICE",
        total: "TOTAL",
        subtotal: "SUBTOTAL",
        discount: "DISCOUNT",
        tax: "TAX (10%)",
        shipping: "SHIPPING",
        grandTotal: "TOTAL",
        thankYou: "Thank you for your purchase!",
        pageNumber: "Generated via Order App",
        statusPaid: "PAID",
        statusPending: "PENDING"
    },
    es: {
        invoiceTitle: "FACTURA",
        invoiceNo: "Nº FACTURA",
        dateIssued: "FECHA EMISIÓN",
        dueDate: "FECHA VENCIMIENTO",
        amount: "IMPORTE",
        from: "DE",
        billTo: "FACTURAR A",
        shipTo: "ENVIAR A",
        product: "PRODUCTO",
        description: "DESCRIPCIÓN",
        qty: "CANT.",
        price: "PRECIO",
        total: "TOTAL",
        subtotal: "SUBTOTAL",
        discount: "DESCUENTO",
        tax: "IMPUESTO (10%)",
        shipping: "ENVÍO",
        grandTotal: "TOTAL",
        thankYou: "¡Gracias por su compra!",
        pageNumber: "Generado vía Order App",
        statusPaid: "PAGADO",
        statusPending: "PENDIENTE"
    },
    fr: {
        invoiceTitle: "FACTURE",
        invoiceNo: "N° FACTURE",
        dateIssued: "DATE D'ÉMISSION",
        dueDate: "DATE D'ÉCHÉANCE",
        amount: "MONTANT",
        from: "DE",
        billTo: "FACTURER À",
        shipTo: "EXPÉDIER À",
        product: "PRODUIT",
        description: "DESCRIPTION",
        qty: "QTÉ",
        price: "PRIX",
        total: "TOTAL",
        subtotal: "SOUS-TOTAL",
        discount: "REMISE",
        tax: "TVA (10%)",
        shipping: "LIVRAISON",
        grandTotal: "TOTAL",
        thankYou: "Merci pour votre achat !",
        pageNumber: "Généré via Order App",
        statusPaid: "PAYÉ",
        statusPending: "EN ATTENTE"
    },
    de: {
        invoiceTitle: "RECHNUNG",
        invoiceNo: "RECHNUNGS-NR.",
        dateIssued: "AUSSTELLUNGSDATUM",
        dueDate: "FÄLLIGKEITS-DATUM",
        amount: "BETRAG",
        from: "VON",
        billTo: "RECHNUNG AN",
        shipTo: "LIEFERUNG AN",
        product: "PRODUKT",
        description: "BESCHREIBUNG",
        qty: "MENGE",
        price: "PREIS",
        total: "GESAMT",
        subtotal: "ZWISCHENSUMME",
        discount: "RABATT",
        tax: "STEUER (10%)",
        shipping: "VERSAND",
        grandTotal: "GESAMTSUMME",
        thankYou: "Vielen Dank für Ihren Einkauf!",
        pageNumber: "Erstellt mit Order App",
        statusPaid: "BEZAHLT",
        statusPending: "AUSSTEHEND"
    },
    pt: {
        invoiceTitle: "FATURA",
        invoiceNo: "Nº FATURA",
        dateIssued: "DATA DE EMISSÃO",
        dueDate: "DATA DE VENCIMENTO",
        amount: "VALOR",
        from: "DE",
        billTo: "FATURAR PARA",
        shipTo: "ENVIAR PARA",
        product: "PRODUTO",
        description: "DESCRIÇÃO",
        qty: "QTD",
        price: "PREÇO",
        total: "TOTAL",
        subtotal: "SUBTOTAL",
        discount: "DESCONTO",
        tax: "IMPOSTO (10%)",
        shipping: "FRETE",
        grandTotal: "TOTAL",
        thankYou: "Obrigado pela sua compra!",
        pageNumber: "Gerado via Order App",
        statusPaid: "PAGO",
        statusPending: "PENDENTE"
    }
};

const LANGUAGES = [
    { code: "en", name: "English (Default)", flag: "https://flagcdn.com/w40/us.png" },
    { code: "es", name: "Spanish (Español)", flag: "https://flagcdn.com/w40/es.png" },
    { code: "fr", name: "French (Français)", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "de", name: "German (Deutsch)", flag: "https://flagcdn.com/w40/de.png" },
    { code: "pt", name: "Portuguese (Português)", flag: "https://flagcdn.com/w40/pt.png" },
];

export default function Translations() {
    const { fetchedTranslations } = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const nav = useNavigation();
    const shopify = useAppBridge();
    const submit = useSubmit();

    // Helper to get translation for a specific language code
    // Prioritize fetched > preset > english preset
    const getTranslationForLang = (code: string) => {
        return fetchedTranslations[code] || PRESETS[code] || PRESETS['en'];
    };

    const [selectedPreset, setSelectedPreset] = useState("en");
    const [formState, setFormState] = useState<InvoiceTranslations>(() => getTranslationForLang("en"));
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const isLoading = nav.state === "submitting";

    useEffect(() => {
        if (actionData?.success) {
            shopify.toast.show("Translations saved successfully");
            // Optionally update local state if we want to reflect the save immediately in "fetchedTranslations" logic
            // But since we are reloading the page or loader usually re-runs, it might be fine.
            // For better UX without reload, we could merge actionData.savedData into our local view of "fetchedTranslations" if we had one.
        } else if (actionData?.error) {
            shopify.toast.show(actionData.error);
        }
    }, [actionData, shopify]);

    const handlePresetSelect = (langCode: string) => {
        setSelectedPreset(langCode);
        setFormState(getTranslationForLang(langCode));
        setIsDropdownOpen(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="p-8 max-w-[1000px] mx-auto">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Translations</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage invoice labels and languages.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="submit"
                        form="translations-form"
                        disabled={isLoading}
                        className="bg-black text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckIcon className="h-4 w-4" />
                        {isLoading ? "Saving..." : "Save Translations"}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-8 relative z-20">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LanguageIcon className="h-5 w-5 text-gray-500" />
                        <span className="font-medium text-gray-700">Language Presets</span>
                    </div>
                    <div className="flex items-center gap-4 relative">
                        {/* Custom Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-between w-64 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                            >
                                <div className="flex items-center gap-3">
                                    <img
                                        src={LANGUAGES.find(l => l.code === selectedPreset)?.flag}
                                        alt=""
                                        className="w-5 h-3.5 object-cover rounded shadow-sm"
                                    />
                                    <span>{LANGUAGES.find(l => l.code === selectedPreset)?.name}</span>
                                </div>
                                <ChevronDownIcon className="w-4 h-4 text-gray-400" aria-hidden="true" />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute right-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none animate-in fade-in zoom-in-95 duration-100">
                                    <div className="py-1">
                                        {LANGUAGES.map((lang) => (
                                            <button
                                                key={lang.code}
                                                onClick={() => handlePresetSelect(lang.code)}
                                                className={`flex items-center w-full px-4 py-2 text-sm text-left gap-3 hover:bg-gray-50 transition-colors ${selectedPreset === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                            >
                                                <img
                                                    src={lang.flag}
                                                    alt=""
                                                    className="w-5 h-3.5 object-cover rounded shadow-sm"
                                                />
                                                <span className="flex-1">{lang.name}</span>
                                                {selectedPreset === lang.code && (
                                                    <CheckIcon className="w-4 h-4 text-blue-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reset indicator (optional, since selecting now auto-resets) */}
                        <button
                            type="button"
                            onClick={() => handlePresetSelect(selectedPreset)}
                            className="text-sm text-gray-400 hover:text-black flex items-center gap-1 transition-colors"
                            title="Re-apply current preset"
                        >
                            <ArrowPathIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8">
                    <Form id="translations-form" method="post" className="space-y-8">
                        <input type="hidden" name="language" value={selectedPreset} />
                        <div>
                            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">General Labels</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <Field label="Invoice Title" name="invoiceTitle" value={formState.invoiceTitle} onChange={handleChange} />
                                <Field label="Invoice No." name="invoiceNo" value={formState.invoiceNo} onChange={handleChange} />
                                <Field label="Date Issued" name="dateIssued" value={formState.dateIssued} onChange={handleChange} />
                                <Field label="Due Date" name="dueDate" value={formState.dueDate} onChange={handleChange} />
                                <Field label="Amount" name="amount" value={formState.amount} onChange={handleChange} />
                                <Field label="Page Number (Footer)" name="pageNumber" value={formState.pageNumber} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">Address Headers</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <Field label="From (Company)" name="from" value={formState.from} onChange={handleChange} />
                                <Field label="Bill To (Customer)" name="billTo" value={formState.billTo} onChange={handleChange} />
                                <Field label="Ship To" name="shipTo" value={formState.shipTo} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">Table Columns</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <Field label="Product" name="product" value={formState.product} onChange={handleChange} />
                                <Field label="Description" name="description" value={formState.description} onChange={handleChange} />
                                <Field label="Quantity" name="qty" value={formState.qty} onChange={handleChange} />
                                <Field label="Price" name="price" value={formState.price} onChange={handleChange} />
                                <Field label="Total (Column)" name="total" value={formState.total} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">Totals & Footer</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <Field label="Subtotal" name="subtotal" value={formState.subtotal} onChange={handleChange} />
                                <Field label="Discount" name="discount" value={formState.discount} onChange={handleChange} />
                                <Field label="Tax" name="tax" value={formState.tax} onChange={handleChange} />
                                <Field label="Shipping" name="shipping" value={formState.shipping} onChange={handleChange} />
                                <Field label="Grand Total" name="grandTotal" value={formState.grandTotal} onChange={handleChange} />
                                <Field label="Thank You Message" name="thankYou" value={formState.thankYou} onChange={handleChange} />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2 mb-6">Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <Field label="Status Paid" name="statusPaid" value={formState.statusPaid} onChange={handleChange} />
                                <Field label="Status Pending" name="statusPending" value={formState.statusPending} onChange={handleChange} />
                            </div>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

function Field({ label, name, value, onChange }: { label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
                type="text"
                name={name}
                id={name}
                value={value}
                onChange={onChange}
                className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-black focus:ring-black sm:text-sm p-2.5 bg-gray-50 transition-colors"
                required
            />
        </div>
    );
}
