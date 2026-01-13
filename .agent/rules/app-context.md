---
trigger: always_on
---

# App Context: qs-invoices

## Overview
`qs-invoices` is a Shopify App built with Remix (React Router v7) and React. It allows merchants to generate and export PDF invoices for their orders.

After adding a new feature/relavant change, save a message to copy-paste here with the new functionality.

## Tech Stack
- **Framework:** React Router v7 (Remix)
- **UI Library:** React 18, Shopify App Bridge
- **Styling:** Tailwind CSS
- **Database:** Prisma
- **PDF Generation:** @react-pdf/renderer
- **Utilities:** JSZip (for bulk exports)

## Key Features
1.  **Orders Management** (`app/routes/app.orders.tsx`):
    -   Lists orders fetched from Shopify.
    -   Supports bulk selection.
    -   Exports invoices as PDF (single) or ZIP (multiple).
2.  **Invoice Settings** (`app/routes/app.settings.tsx`):
    -   Configures invoice details (Logo, Company Info).
    -   Live preview of the invoice.
3.  **App & Webhooks**:
    -   `app/routes/app.tsx`: Main app layout.
    -   `app/routes/webhooks.app.uninstalled.tsx`: Handles app uninstallation.
    -   `app/routes/webhooks.app.scopes_update.tsx`: Handles scope updates.

## Key Files & Directories
-   `app/routes/`: Contains all application routes.
-   `app/services/`: Backend services (Shopify API, Invoice logic).
-   `package.json`: Dependencies and scripts.

## Development
-   `npm run dev`: Starts the local development server with Shopify CLI.
-   `npm run prisma`: Runs Prisma commands.