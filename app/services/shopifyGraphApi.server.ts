import { authenticate } from "../shopify.server";

export const getShopId = async (request: Request): Promise<string> => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
        `#graphql
    query shopId {
      shop {
        id
      }
    }`,
    );

    const data = await response.json();
    const shopId = data.data?.shop?.id;

    if (!shopId) {
        throw new Error("Failed to retrieve shop ID");
    }

    return shopId;
};

export const getOrders = async (request: Request) => {
    const { admin } = await authenticate.admin(request);

    const response = await admin.graphql(
        `#graphql
        query getOrders {
            shop {
                name
                email
                billingAddress {
                    address1
                    address2
                    city
                    province
                    country
                    zip
                }
            }
            orders(first: 50, sortKey: CREATED_AT, reverse: true) {
                edges {
                    node {
                        id
                        name
                        createdAt
                        email
                        displayFulfillmentStatus
                        displayFinancialStatus
                        totalPriceSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }
                        currentSubtotalPriceSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }
                        totalTaxSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }
                        totalShippingPriceSet {
                            shopMoney {
                                amount
                                currencyCode
                            }
                        }
                        customer {
                            displayName
                            email
                            phone
                            defaultAddress {
                                address1
                                address2
                                city
                                province
                                country
                                zip
                            }
                        }
                        billingAddress {
                            address1
                            address2
                            city
                            province
                            country
                            zip
                        }
                        shippingAddress {
                            address1
                            address2
                            city
                            province
                            country
                            zip
                        }
                        lineItems(first: 20) {
                            edges {
                                node {
                                    title
                                    variantTitle
                                    quantity
                                    originalUnitPriceSet {
                                        shopMoney {
                                            amount
                                            currencyCode
                                        }
                                    }
                                    image {
                                        url
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`
    );

    const data: any = await response.json();

    if (data.errors) {
        throw new Error("Failed to fetch orders: " + JSON.stringify(data.errors));
    }

    return {
        shop: data.data.shop,
        orders: data.data.orders.edges.map((edge: any) => edge.node),
    };
};
