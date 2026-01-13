import type { ActionFunctionArgs } from "react-router";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  let parsed;

  try {
    parsed = await authenticate.webhook(request);
  } catch (err) {
    console.error("Error authenticating webhook:", err);
    // If auth fails, it's better to return 401/400 — but for debugging, log it.
    throw new Response("Webhook authentication failed", { status: 401 });
  }

  const { topic, shop, session } = parsed;

  console.log("Webhook hit. Topic:", topic, "Shop:", shop, "Session:", !!session);

  switch (topic) {
    // Try the raw topic format you see in the Dev Dashboard
    case "app/uninstalled":
    // Optionally also handle the enum-style topic just in case:
    case "APP_UNINSTALLED":
      try {
        // Adjust this to your actual Prisma model & field names:
        await prisma.session.deleteMany({
          where: { shop },
        });

        console.log("Deleted sessions for shop:", shop);
      } catch (err) {
        console.error("Failed to delete sessions for shop:", shop, err);
        // Don't throw a non-200 here; Shopify will just retry. Log and continue.
      }
      break;

    default:
      console.error("Unhandled webhook topic value:", topic);
      // For now, just log and *don't* return 404 so we can confirm topic:
      // throw new Response("Unhandled webhook topic", { status: 404 });
      break;
  }

  // Always return 200 so Shopify doesn't keep retrying
  throw new Response();
};
