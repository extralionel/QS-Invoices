import { generateSignature } from "./signature.server";


import type { InvoiceConfiguration, InvoiceTranslations } from "./invoice.shared";

export type { InvoiceConfiguration, InvoiceTranslations };
export { DEFAULT_TRANSLATIONS } from "./invoice.shared";

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
