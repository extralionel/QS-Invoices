# App Context: qs-invoices

## Overview
This is the **Frontend** for the Shopify app `qs-invoices`, built using React Router 7 (Remix) and Tailwind CSS.
The core business logic and heavy operations are handled by a separate **Java Spring Boot** backend.

## Tech Stack
- **Frontend**: React Router 7 TypeScript (Remix)
- **Styling**: Tailwind CSS
- **Backend**: Java Spring Boot (Separate Service)
- **Database**: Prisma (Used for session storage / auth, but main data is managed by the Java backend)
- **Package Manager**: npm
- **Build Tool**: Vite

## Key Features (Planned)
- Dashboard: Overview of app activity.
- Settings: App configuration.
- Orders: List and manage orders/invoices.
- Plans: Subscription plans for the app.

## Directory Structure
- `app/`: Main application code (routes, components).
- `extensions/`: Shopify app extensions.
- `prisma/`: Database schema and migrations (Session storage).

## Shopify Config
- `shopify.app.toml`: Shopify app configuration file. Push config changes with `shopify app deploy`.
- `shopify.app.dev.toml`: Shopify app development configuration file.

