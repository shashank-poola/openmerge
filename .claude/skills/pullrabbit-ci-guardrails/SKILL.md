---
name: pullrabbit-ci-guardrails
description: Use when changing PullRabbit code, workflows, database migrations, or release/deployment setup. Enforces branch-based development, CI expectations, migration safety, and main-branch protection rules.
---

# PullRabbit CI Guardrails

## Branch workflow

Never work directly on `main` for feature, fix, infra, or docs changes once branch protection is enabled.

Use this flow:

1. Create a short-lived branch from latest `main`.
2. Make focused changes.
3. Run local validation when possible.
4. Push the branch.
5. Open a pull request into `main`.
6. Wait for required GitHub Actions checks.
7. Review and merge only after checks pass.

Recommended branch names:

- `feature/<short-name>`
- `fix/<short-name>`
- `chore/<short-name>`
- `infra/<short-name>`
- `docs/<short-name>`

## Required validation

Before saying work is ready, run the most specific checks available.

For CI-related or broad app changes, run:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run build
```

For database/schema changes, also run from `packages/database`:

```bash
bun run validate
bun run generate
```

Do not run production migrations from a normal PR workflow. Production migrations must go through the protected `migrate-production.yml` workflow.

## CI ownership

The main validation workflows are:

- `.github/workflows/test.yml` — PR and main validation entrypoint
- `.github/workflows/pullrabbit.yml` — reusable install, Prisma, lint, typecheck, build workflow
- `.github/workflows/security.yml` — CodeQL and dependency review
- `.github/workflows/migrate-production.yml` — manual production DB migration workflow

If package scripts change, update the workflows and lockfile together.

## Lockfile rules

This repo uses Bun. If `package.json` or workspace package manifests change, run:

```bash
bun install
bun install --frozen-lockfile
```

Commit `bun.lock` when it changes.

## Main protection policy

`main` should require:

- pull request before merge
- passing CI checks
- at least one approval
- conversation resolution
- no force pushes
- no deletions

Agents must not suggest direct pushes to `main` except for one-time bootstrap work explicitly requested by the maintainer before branch protection is enabled.

## Production safety

Never expose secrets in committed files or logs.

Deployment and production migrations must use GitHub Environments and repository/environment secrets, not local `.env` files.
