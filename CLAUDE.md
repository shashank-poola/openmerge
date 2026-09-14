# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

OpenMerge is an AI-powered GitHub PR reviewer. It installs as a GitHub App, receives webhook events when PRs are opened, queues review jobs, and posts inline comments via a bot account.

## Commands

All commands run from repo root. Uses **Bun** as package manager and **Turbo** for orchestration.

```bash
bun install          # Install all workspace deps
bun run dev          # Start all services in watch mode
bun run build        # Build all workspaces
bun run lint         # Lint all workspaces
bun run format       # Format all workspaces
bun run typecheck    # Type-check all workspaces
```

Run a single workspace:
```bash
bun run dev --filter=server
bun run dev --filter=web
bun run dev --filter=worker
```

Database (from `packages/database`):
```bash
bun run db:migrate:dev     # Create + apply dev migration
bun run db:push            # Push schema without migration
bun run db:seed            # Seed database
bun run studio             # Open Prisma Studio
```

Local infrastructure (PostgreSQL 5432, Redis 6379):
```bash
docker compose up -d
```

## Architecture

### Request Flow

```
PR Opened → GitHub webhook → apps/server (validates + queues)
                                       ↓
                           apps/worker (dequeues from Redis)
                                       ↓
                           Context Fetcher (parallel):
                             - AST diff analysis
                             - Code graph traversal
                             - Linter / SAST
                             - PR history lookup
                             - Import resolution
                                       ↓
                           LangGraph multi-agent review:
                             - Code agent
                             - Security agent
                             - Performance agent
                             (context stored in Qdrant)
                                       ↓
                           Aggregator → GitHub bot posts inline comments
```

### Monorepo Layout

```
apps/
  server/    Express API — GitHub OAuth, webhook ingestion, REST routes
  worker/    Bun job worker — PR review pipeline (LangGraph agents)
  web/       Next.js 16 dashboard — user/repo management UI
  cli/       Commander + Ink TUI — dev tooling
packages/
  database/  @repo/database — Prisma schema + pg client
  redis/     @repo/redis — Redis client wrapper
  ui/        Shared React components
```

### Key Patterns

**Observability:** `apps/server/src/observability/langfuse.ts` wires Langfuse tracing through an OpenTelemetry span processor and the LangChain callback handler. It is inert unless `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are set, and any tracing failure disables itself rather than failing the review. The worker wraps each review in `withReviewTrace` so every agent call lands in one trace keyed by `reviewSessionId`, then flushes with a bounded timeout after each job.

**Environment validation:** `apps/server/src/config/env.ts` uses Zod to parse and validate all env vars at startup. Add new vars there first.

**Database:** Single Prisma schema at `packages/database/prisma/schema.prisma`. Import client as `import { db } from "@repo/database"`. Models: User, Installation, Repository, Subscription, ReviewSession, ReviewComment.

**Auth:** GitHub OAuth issues JWT (7-day). `apps/server/src/middleware/auth.middleware.ts` verifies token on protected routes.

**Route structure in server:** route file → controller directory → Zod schema validation. E.g., `routes/webhook.route.ts` → `controllers/webhook-controller/`.

**Shared TS config:** All packages extend `@workspace/typescript-config/base.json`. ESLint configs extend `@workspace/eslint-config`.

### Required Environment Variables

Server needs: `PORT`, `SERVER_JWT_SECRET`, `DATABASE_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SERVER`, `GITHUB_CALLBACK_URL`, `GITHUB_APP_ID`, `GITHUB_APP_NAME`, `GITHUB_APP_CLIENT_ID`, `GITHUB_APP_CLIENT_SECRET`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_PRIVATE_KEY`, `QDRANT_URL`, `QDRANT_CLUSTER_ID`.

Optional: `REDIS_URL`, `EMBED_MODEL`, `GOOGLE_GEMINI_API`, `EXA_API`, `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`, `LANGFUSE_TRACING_ENVIRONMENT`.

Web needs: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`.
