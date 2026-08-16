# Contributing to PullRabbit

## Branch workflow

All changes should follow this flow:

1. Update local `main`.
2. Create a branch from `main`.
3. Commit focused changes.
4. Push the branch.
5. Open a pull request into `main`.
6. Wait for CI and review.
7. Merge only after required checks pass.

Do not push directly to `main` once branch protection is enabled.

## Branch naming

Use short, descriptive branch names:

- `feature/<name>`
- `fix/<name>`
- `chore/<name>`
- `infra/<name>`
- `docs/<name>`

Examples:

```bash
git checkout main
git pull origin main
git checkout -b infra/protect-main-workflow
```

## Local validation

Before opening a PR, run:

```bash
bun install --frozen-lockfile
bun run lint
bun run typecheck
bun run build
```

For Prisma/database changes, also run from `packages/database`:

```bash
bun run validate
bun run generate
```

## Production safety

- Never commit secrets or local `.env` values.
- Do not run production migrations from PR CI.
- Use the protected GitHub Actions workflow for production migrations.
- Deployment workflows should use GitHub environments and protected secrets.
