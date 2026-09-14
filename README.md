<p align="center">
  <img src="apps/web/public/companies/openmerge.png" alt="OpenMerge" width="120" />
</p>

<h1 align="center">OpenMerge</h1>

<p align="center">
  <strong>AI code reviewer for pull requests.</strong>
</p>

<p align="center">
  OpenMerge reviews GitHub pull requests for correctness, security, and performance issues, then leaves focused comments directly on the code that needs attention.
</p>

<p align="center">
  <a href="https://github.com/apps/openmerge-app">Install the GitHub App</a> · <a href="LICENSE">MIT License</a> · <a href="https://bun.sh">Built with Bun</a>
</p>

---

## What OpenMerge does

Code review is more useful when it understands more than a patch. OpenMerge starts with the changed lines, then follows imports, parses the affected code, maps nearby calls, and checks relevant history. That context helps it explain *why* something may be a problem not simply point at a suspicious line.

When a pull request opens or is updated, OpenMerge reviews it automatically and posts the results where your team already works: on the pull request.

It is designed to catch the things that are easy to miss in a fast review: a broken condition, an unsafe input path, an expensive query in a loop, or a change whose effect reaches further than the diff suggests. Human reviewers still decide whether a change is right for the product.

## How a review happens

```text
Pull request opened or updated
              │
              ▼
GitHub sends OpenMerge a signed webhook
              │
              ▼
OpenMerge collects the diff and surrounding code context
              │
              ▼
Code, security, and performance reviewers run in parallel
              │
              ▼
Duplicate findings are filtered and ranked by severity
              │
              ▼
Clear inline comments are posted to the pull request
```

The context phase includes AST analysis, call-graph traversal, import resolution, static checks, and related pull-request history. Reviews are kept concise: findings are deduplicated, ranked from critical to low severity, and capped so a pull request remains readable.

## What it reviews

| Reviewer | Looks for | Example |
| --- | --- | --- |
| **Code** | Correctness, regressions, edge cases, and error handling | A branch that silently skips an empty result. |
| **Security** | Unsafe input handling, authentication mistakes, secrets, and injection risks | User input reaching a query without validation. |
| **Performance** | Avoidable work, blocking I/O, N+1 queries, and unnecessary renders | A database request made once for every item in a list. |

OpenMerge comments only when it has something actionable to say. It is an additional reviewer, not an approval bot and not a substitute for understanding product requirements.

## Install OpenMerge

The quickest way to use OpenMerge is through the GitHub App.

1. Install [OpenMerge on GitHub](https://github.com/apps/openmerge-app).
2. Choose the repositories OpenMerge can access.
3. Open or update a pull request.

OpenMerge receives the pull-request event, starts a review, and adds comments back to that pull request. There is no separate dashboard to watch during a review.

## OpenMerge in simple terms

- OpenMerge connects to GitHub and watches for new or updated pull requests.
- It reads the changed files and the surrounding code so it can understand how a change affects the rest of the project.
- Three reviewers work at the same time: one checks correctness, one checks security, and one checks performance.
- Their findings are combined, duplicate comments are removed, and the most important issues are shown first.
- OpenMerge posts clear, actionable comments directly on the pull request.
- It helps human reviewers move faster; it does not replace their judgment about the product or the code.

## Running it in production

OpenMerge is a small distributed system: the web app serves the interface, the API verifies GitHub events and creates review jobs, and the worker processes those jobs. PostgreSQL stores application and webhook state; Redis carries the review queue.

For a dependable deployment:

- run the API and worker as separate, independently restartable services;
- use managed PostgreSQL and Redis with persistent storage and backups;
- keep GitHub, model-provider, and database credentials in a secret manager;
- set `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_API_URL`, and `GITHUB_CALLBACK_URL` to their public HTTPS addresses;
- apply database migrations as part of deployment with `bun --cwd packages/database run db:migrate:deploy`;
- configure health checks, structured logs, queue monitoring, and alerts for failed jobs; and
- optionally set `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, and `LANGFUSE_BASE_URL` (plus `LANGFUSE_TRACING_ENVIRONMENT`) to send model traces, token usage, and latency for every review to [Langfuse](https://langfuse.com). Tracing stays off when the keys are absent.

Only install the GitHub App on repositories you intend OpenMerge to review. Rotate any exposed GitHub private key, webhook secret, OAuth secret, or model-provider key immediately.

## Project status

OpenMerge is in beta. The core pull-request review flow is working; features such as richer repository memory, streaming findings, configurable review rules, and additional notifications are evolving. Review every finding before acting on it, especially for security-sensitive changes.

## Contributing

Issues and pull requests are welcome. Keep changes focused, validate inputs at service boundaries, and add or update tests with behavior changes. Before submitting a pull request, run the relevant workspace checks and tests.

## License

OpenMerge is released under the [MIT License](LICENSE).

---

Built for teams that want calmer, more informed pull-request reviews.
