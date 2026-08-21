# OpenMerge Tests

Tests are organized by test type first, then by product domain.

```text
tests/
  support/          Shared test helpers and env setup
  unit/             Fast isolated tests for pure logic and middleware
    auth/
    graph/
    schema/
    types/
  integration/      Boundary tests for controllers and module interactions
    auth/
    health/
```

## Commands

Run all tests:

```bash
bun run test
```

Run only unit tests:

```bash
bun run test:unit
```

Run only integration tests:

```bash
bun run test:integration
```

## Guidelines

- Prefer unit tests for pure parsing, schemas, mappers, middleware, and small utilities.
- Prefer integration tests for controller behavior, mocked external APIs, database boundaries, queue boundaries, and multi-module flows.
- Do not hit live GitHub, Supabase, Redis, Qdrant, or LLM providers from tests.
- Mock external boundaries and assert failure modes before success paths.
- Keep fixtures small and colocated with the test domain unless they are reused widely.
