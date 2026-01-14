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
