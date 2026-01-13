import { generateSignature } from "./signature.server";

export interface InvoiceConfiguration {
    shopName: string;
    companyName: string;
    taxNumber: string;
    registerNumber: string;
    address: string;
    email: string;
    phoneNumber: string;
    imageId: number | null;
}

export interface InvoiceTranslations {
    invoiceTitle: string;
    invoiceNo: string;
    dateIssued: string;
    dueDate: string;
    amount: string;
    from: string;
    billTo: string;
    shipTo: string;
    product: string;
    description: string;
    qty: string;
    price: string;
    total: string;
    subtotal: string;
    discount: string;
    tax: string;
    shipping: string;
    grandTotal: string;
    thankYou: string;
    pageNumber: string;
    statusPaid: string;
    statusPending: string;
}

export const DEFAULT_TRANSLATIONS: InvoiceTranslations = {
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
};

export const getInvoiceConfiguration = async (shop: string): Promise<InvoiceConfiguration> => {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        throw new Error("BACKEND_URL is not defined");
    }

    const signature = generateSignature("");

    console.log("Fetching settings for shop:", shop);
    const response = await fetch(`${backendUrl}/api/v1/invoice?shopifyId=${shop}`, {
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Hmac-Sha256": signature,
        },
    });

    if (!response.ok) {
        // Handle 404 or other errors gracefully usually
        if (response.status === 404) {
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
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
    }

    return await response.json();
};

export const updateInvoiceConfiguration = async (shop: string, data: InvoiceConfiguration): Promise<void> => {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        throw new Error("BACKEND_URL is not defined");
    }

    const signature = generateSignature(data);

    const response = await fetch(`${backendUrl}/api/v1/invoice?shopifyId=${shop}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Hmac-Sha256": signature,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update settings: ${response.statusText}`);
    }
};

export const getInvoiceTranslations = async (shop: string): Promise<Record<string, InvoiceTranslations>> => {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        throw new Error("BACKEND_URL is not defined");
    }

    const signature = generateSignature(""); // Empty payload for GET usually

    console.log("Fetching translations for shop:", shop);
    const response = await fetch(`${backendUrl}/api/v1/invoice/translations?shopifyId=${shop}`, {
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Hmac-Sha256": signature,
        },
    });

    if (!response.ok) {
        if (response.status === 404) {
            return {};
        }
        // If the endpoint is not implemented yet, fallback to empty object
        // check if response is HTML (often 404 page)
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") === -1) {
            console.warn("Backend endpoint /api/v1/invoice/translations probably missing. Using empty defaults.");
            return {};
        }

        throw new Error(`Failed to fetch translations: ${response.statusText}`);
    }

    return await response.json();
};

export const updateInvoiceTranslations = async (shop: string, data: Record<string, InvoiceTranslations>): Promise<void> => {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
        throw new Error("BACKEND_URL is not defined");
    }

    const signature = generateSignature(data);

    const response = await fetch(`${backendUrl}/api/v1/invoice/translations?shopifyId=${shop}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Hmac-Sha256": signature,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`Failed to update translations: ${response.statusText}`);
    }
};
