import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

const COLORS = {
    primary: '#000000', // Pure Black
    secondary: '#404040', // Dark Gray
    border: '#E5E5E5', // Light Gray Border
    background: '#FAFAFA', // Very Light Gray Background
    white: '#FFFFFF',
    textMain: '#000000',
    textMuted: '#666666',
};

Font.register({
    family: 'Poppins',
    fonts: [
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.woff', fontWeight: 'normal' },
        { src: 'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-700-normal.woff', fontWeight: 'bold' },
    ],
});

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: COLORS.white,
        fontFamily: 'Poppins',
        padding: 30, // Reduced from 40
        paddingBottom: 60,
        fontSize: 10,
        color: COLORS.textMain,
    },
    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20, // Reduced from 40
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        paddingBottom: 10, // Reduced from 20
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 30, // Reduced from 40
        height: 30,
        marginRight: 10,
        backgroundColor: '#F0F0F0',
        borderRadius: 1,
    },
    companyTitle: {
        fontSize: 14, // Reduced from 16
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    invoiceTitleBlock: {
        alignItems: 'flex-end',
    },
    invoiceTitle: {
        fontSize: 20, // Reduced from 24
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 2,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    invoiceStatus: {
        fontSize: 9,
        paddingVertical: 3,
        paddingHorizontal: 10,
        backgroundColor: COLORS.primary,
        color: COLORS.white,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },

    // Info Grid
    infoGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20, // Reduced from 40
    },
    infoColumn: {
        flexDirection: 'column',
        width: '30%',
    },
    infoLabel: {
        fontSize: 7, // Slightly smaller
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: 'bold',
        letterSpacing: 1,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 2,
        alignSelf: 'flex-start',
    },
    infoText: {
        fontSize: 9, // Slightly smaller
        color: COLORS.textMain,
        lineHeight: 1.1, // Tighter leading
    },
    infoTextBold: {
        fontWeight: 'bold',
        marginBottom: 2,
    },

    // Invoice Meta (Dates) - Minimalist Line Style
    metaLine: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20, // Reduced from 40
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingBottom: 8,
    },
    metaItem: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    metaLabel: {
        fontSize: 7,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        marginBottom: 1,
        letterSpacing: 1,
    },
    metaValue: {
        fontSize: 10,
        color: COLORS.primary,
        fontWeight: 'bold',
    },

    // Table
    tableContainer: {
        marginTop: 10,
        marginBottom: 10, // Reduced from 20
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: COLORS.primary,
        paddingBottom: 6,
        marginBottom: 8,
    },
    tableHeaderCell: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 8, // Reduced from 12
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center',
        minHeight: 30, // Reduced
    },
    // Columns
    colImage: { width: '10%' },
    colDesc: { width: '40%' },
    colQty: { width: '15%', textAlign: 'center' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },

    productImage: {
        width: 25, // Reduced
        height: 25,
        objectFit: 'contain',
        backgroundColor: '#FAFAFA',
        borderRadius: 4,
    },
    rowTitle: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.textMain,
        marginBottom: 2,
    },
    rowSubtitle: {
        fontSize: 7,
        color: COLORS.textMuted,
    },
    cellText: {
        fontSize: 9,
        color: COLORS.textMain,
    },

    // Totals Section - Card Style
    totalsSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 15,
    },
    totalsCard: {
        width: '40%', // Slightly narrower
        backgroundColor: '#FAFAFA',
        padding: 10, // Reduced padding
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6, // Reduced
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    totalRowLast: {
        borderBottomWidth: 0,
    },
    totalLabel: {
        fontSize: 8,
        color: COLORS.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    totalValue: {
        fontSize: 9,
        fontWeight: 'bold',
        color: COLORS.textMain,
    },
    // Grand Total
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        marginTop: 4,
        backgroundColor: COLORS.primary,
        paddingHorizontal: 8,
        borderRadius: 2,
    },
    grandTotalLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.white,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    grandTotalValue: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.white,
    },


    // Footer
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: COLORS.primary,
        paddingTop: 15,
        alignItems: 'center',
    },
    footerContent: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    footerTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    socialIcons: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'center',
        gap: 15, // Note: gap might not work in older react-pdf versions, fallback to margin
    },
    socialIcon: {
        width: 15,
        height: 15,
        marginHorizontal: 8,
        opacity: 0.6,
    },
    pageNumber: {
        fontSize: 8,
        color: COLORS.textMuted,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
});

interface OrderItem {
    description: string;
    descriptionDetail?: string;
    quantity: number;
    price: number;
    total: number;
    image?: string;
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

const DEFAULT_TRANSLATIONS: InvoiceTranslations = {
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

export interface InvoiceData {
    number: string;
    date: string;
    dueDate: string;
    status: string;
    company: {
        name: string;
        legalName: string;
        address: string[];
        email: string;
        phone?: string;
        logoUrl?: string;
    };
    customer: {
        name: string;
        email: string;
        phone?: string;
        billingAddress: string[];
        shippingAddress?: string[];
    };
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
    notes?: string;
    currencySymbol: string;
    translations?: InvoiceTranslations;
}

interface InvoiceTemplateProps {
    data: InvoiceData;
}

export const InvoiceTemplate = ({ data }: InvoiceTemplateProps) => {
    const t = data.translations || DEFAULT_TRANSLATIONS;
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {data.company.logoUrl ? (
                            <Image style={styles.logo} src={data.company.logoUrl} />
                        ) : (
                            <View style={styles.logo} />
                        )}
                        <View>
                            <Text style={styles.companyTitle}>{data.company.name}</Text>
                            <Text style={[styles.infoText, { fontSize: 8 }]}>{data.company.legalName}</Text>
                        </View>
                    </View>
                    <View style={styles.invoiceTitleBlock}>
                        <Text style={styles.invoiceTitle}>{t.invoiceTitle}</Text>
                        <Text style={styles.invoiceStatus}>{data.status === 'PAID' ? t.statusPaid : t.statusPending}</Text>
                    </View>
                </View>

                {/* Meta Dates Bar - Clean Lines */}
                <View style={styles.metaLine}>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>{t.invoiceNo}</Text>
                        <Text style={styles.metaValue}>{data.number}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>{t.dateIssued}</Text>
                        <Text style={styles.metaValue}>{data.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>{t.dueDate}</Text>
                        <Text style={styles.metaValue}>{data.dueDate}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Text style={styles.metaLabel}>{t.amount}</Text>
                        <Text style={styles.metaValue}>{data.currencySymbol}{data.total.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Addresses Grid */}
                <View style={styles.infoGrid}>
                    {/* From (Company) */}
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>{t.from}</Text>
                        <Text style={styles.infoTextBold}>{data.company.name}</Text>
                        {data.company.address.map((line, i) => (
                            <Text key={i} style={styles.infoText}>{line}</Text>
                        ))}
                        <Text style={styles.infoText}>{data.company.email}</Text>
                    </View>

                    {/* Bill To */}
                    <View style={styles.infoColumn}>
                        <Text style={styles.infoLabel}>{t.billTo}</Text>
                        <Text style={styles.infoTextBold}>{data.customer.name}</Text>
                        {data.customer.billingAddress.map((line, i) => (
                            <Text key={i} style={styles.infoText}>{line}</Text>
                        ))}
                        <Text style={styles.infoText}>{data.customer.email}</Text>
                    </View>

                    {/* Ship To */}
                    {data.customer.shippingAddress && (
                        <View style={styles.infoColumn}>
                            <Text style={styles.infoLabel}>{t.shipTo}</Text>
                            <Text style={styles.infoTextBold}>{data.customer.name}</Text>
                            {data.customer.shippingAddress.map((line, i) => (
                                <Text key={i} style={styles.infoText}>{line}</Text>
                            ))}
                        </View>
                    )}
                </View>

                {/* Items Table */}
                <View style={styles.tableContainer}>
                    {/* Header */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, styles.colImage]}>{t.product}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colDesc]}>{t.description}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colQty]}>{t.qty}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colPrice]}>{t.price}</Text>
                        <Text style={[styles.tableHeaderCell, styles.colTotal]}>{t.total}</Text>
                    </View>

                    {/* Rows */}
                    {data.items.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={styles.colImage}>
                                {item.image ? (
                                    <Image style={styles.productImage} src={item.image} />
                                ) : (
                                    <View style={styles.productImage} />
                                )}
                            </View>
                            <View style={styles.colDesc}>
                                <Text style={styles.rowTitle}>{item.description}</Text>
                                {item.descriptionDetail && <Text style={styles.rowSubtitle}>{item.descriptionDetail}</Text>}
                            </View>
                            <Text style={[styles.cellText, styles.colQty]}>{item.quantity}</Text>
                            <Text style={[styles.cellText, styles.colPrice]}>{data.currencySymbol}{item.price.toFixed(2)}</Text>
                            <Text style={[styles.cellText, styles.colTotal]}>{data.currencySymbol}{item.total.toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Totals Section - Card Style */}
                <View style={styles.totalsSection} wrap={false}>
                    <View style={styles.totalsCard}>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t.subtotal}</Text>
                            <Text style={styles.totalValue}>{data.currencySymbol}{data.subtotal.toFixed(2)}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t.discount}</Text>
                            <Text style={styles.totalValue}>{data.currencySymbol}0.00</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>{t.tax}</Text>
                            <Text style={styles.totalValue}>{data.currencySymbol}{data.tax.toFixed(2)}</Text>
                        </View>
                        <View style={[styles.totalRow, styles.totalRowLast]}>
                            <Text style={styles.totalLabel}>{t.shipping}</Text>
                            <Text style={styles.totalValue}>{data.currencySymbol}{data.shipping.toFixed(2)}</Text>
                        </View>

                        {/* Dark Grand Total Bar inside Card */}
                        <View style={styles.grandTotalRow}>
                            <Text style={styles.grandTotalLabel}>{t.grandTotal}</Text>
                            <Text style={styles.grandTotalValue}>{data.currencySymbol}{data.total.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerContent}>
                        <Text style={styles.footerTitle}>{t.thankYou}</Text>

                        <View style={styles.socialIcons}>
                            {/* Facebook Icon */}
                            <Image
                                style={styles.socialIcon}
                                src="https://cdn-icons-png.flaticon.com/512/20/20673.png" // Simple FB icon
                            />
                            {/* Instagram Icon */}
                            <Image
                                style={styles.socialIcon}
                                src="https://cdn-icons-png.flaticon.com/512/1384/1384031.png" // Simple Insta icon
                            />
                            {/* Twitter/X Icon */}
                            <Image
                                style={styles.socialIcon}
                                src="https://cdn-icons-png.flaticon.com/512/3670/3670211.png" // Simple Twitter icon
                            />
                        </View>
                    </View>
                    <Text style={styles.pageNumber}>
                        {t.pageNumber}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

