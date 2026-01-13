import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

import { generateSignature } from "./services/signature.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
  hooks: {
    afterAuth: async ({ session, admin }) => {
      console.log("Syncing shop details with backend...", { shop: session.shop });

      try {
        const response = await admin.graphql(
          `#graphql
            query shopInfo {
              shop {
                name
                email
                myshopifyDomain
                currencyCode
                billingAddress {
                  country
                  city
                  address1
                  address2
                  zip
                  phone
                }
              }
            }`,
        );

        const data = await response.json();
        const shop = data.data?.shop;

        if (shop) {
          const backendUrl = process.env.BACKEND_URL;
          if (!backendUrl) {
            console.log("BACKEND_URL not set, skipping sync.");
            return;
          }

          const payload = {
            ...shop,
            accessToken: session.accessToken, // Optional: if backend needs to store it
            shop: session.shop,
          };
          const signature = generateSignature(payload);

          await fetch(`${backendUrl}/shop`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Hmac-Sha256": signature,
            },
            body: JSON.stringify(payload),
          });
          console.log("Shop details synced successfully.");
        }
      } catch (error) {
        console.log("Failed to sync shop details:", { error });
      }
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
