# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Contains a municipal election voting system.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: Neon PostgreSQL (via NEON_DATABASE_URL) + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS

## Application: Elecciones Municipales 2026

### Features
- **Public page** (`/`): Shows candidates with photo/name, vote anonymously or with name, one vote per person (fingerprint-based), mobile responsive
- **Admin panel** (`/admin`): Password-protected (default: admin123), add/edit/delete candidates with photo upload, view vote statistics, change password

### Design
- Dark theme (#0f141e background) with gold accents (#c9a03d)
- Professional election-style design
- Photos stored as base64 in database

### Database Tables
- `candidates`: id, name, photo (base64), created_at
- `votes`: id, candidate_id, voter_name (nullable), voter_fingerprint, created_at
- `admin_settings`: id, key, value (stores hashed admin password)

### API Endpoints
- `GET /api/candidates` - List all candidates
- `POST /api/votes` - Cast a vote
- `POST /api/votes/check` - Check if fingerprint already voted
- `POST /api/admin/login` - Admin login
- `PUT /api/admin/password` - Change admin password
- `POST /api/admin/candidates` - Create candidate
- `PUT /api/admin/candidates/:id` - Update candidate
- `DELETE /api/admin/candidates/:id` - Delete candidate
- `GET /api/admin/stats` - Get voting statistics

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
