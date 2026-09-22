<p align="center">
  <img src="apps/web/public/companies/openmerge.png" alt="OpenMerge" width="96" />
</p>

<h1 align="center">OpenMerge</h1>

<p align="center">
  <strong>The PR bot that reviews more than the diff.</strong>
</p>

<p align="center">
  OpenMerge automatically reviews GitHub pull requests with code quality, security, and performance agents. It builds context from the changed code, follows related files and history, then posts a clear summary and actionable inline comments back to GitHub.
</p>

<p align="center">
  <a href="https://openmerge.xyz">Get started</a> ·
  <a href="https://github.com/apps/openmerge-app/installations/select_target">Install on GitHub</a> ·
  <a href="LICENSE">MIT License</a> ·
  <a href="https://bun.sh">Built with Bun</a>
</p>

<p align="center">
  <img src="apps/web/public/reviews/second.jpg" alt="OpenMerge review summary posted to a GitHub pull request" width="900" />
</p>

## Get Started

1. Sign in at [openmerge.xyz](https://openmerge.xyz) with your GitHub account.
2. [Install the OpenMerge GitHub App](https://github.com/apps/openmerge-app/installations/select_target).
3. Choose the repositories OpenMerge can review.
4. Open or update a pull request. OpenMerge will post its review directly on the pull request.

OpenMerge reviews pull requests when they are opened, reopened, or updated with new commits. There is no separate review command to run in your repository.

## Review Configuration

Add an `.openmerge.yml` file to the root of a repository to control which agents run and which files they inspect:

~~~yaml
agents:
  code_quality: true
  security: true
  performance: true

ignore:
  - "**/*.test.ts"
  - "migrations/**"
  - "*.generated.*"

severity_threshold: warning
~~~

### Configuration Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `agents.code_quality` | boolean | `true` | Enable correctness and code quality findings. |
| `agents.security` | boolean | `true` | Enable security findings such as injection risks and exposed secrets. |
| `agents.performance` | boolean | `true` | Enable performance findings such as N+1 queries and unnecessary work. |
| `ignore` | string[] | `[]` | Glob patterns to exclude from review. |
| `severity_threshold` | string | `warning` | Minimum severity to report: `info`, `warning`, or `error`. |

If `.openmerge.yml` is not present, OpenMerge uses the defaults shown above.

## How a Review Works

~~~text
Pull request opened, reopened, or updated
                  │
                  ▼
OpenMerge validates the signed GitHub webhook
                  │
                  ▼
The context pipeline collects the diff, ASTs, imports, history, and checks
                  │
                  ▼
Code quality, security, and performance agents run in parallel
                  │
                  ▼
Findings are combined, deduplicated, and ranked by severity
                  │
                  ▼
A summary and inline comments are posted back to the pull request
~~~

The context pipeline is designed to look beyond changed lines. It can inspect related files, resolve imports, traverse the code graph, run linters or static checks, and use relevant pull-request history before the agents make a finding.

## What OpenMerge Reviews

### Code Quality

Finds correctness issues, regressions, dead code, edge cases, naming problems, and missing error handling.

### Security

Looks for unsafe input handling, injection risks, exposed secrets, insecure dependencies, and common OWASP-style issues.

### Performance

Checks for N+1 queries, missing indexes, blocking work, unnecessary allocations, unbounded fetches, and avoidable algorithmic cost.

OpenMerge is an additional reviewer. Human reviewers still decide whether a change fits the product and is safe to merge.

## Roadmap

- Richer repository memory and cross-file context
- Streaming review progress and findings
- More granular per-repository review rules
- Additional notifications and integrations
- More model and provider controls

## Local Development

### Prerequisites

- [Bun](https://bun.sh) 1.2.22 or newer
- Node.js 20 or newer
- Docker Desktop with Docker Compose
- A GitHub account with permission to create GitHub Apps
- A GitHub OAuth App and GitHub App
- A Groq API key for the default review agents
- A Gemini API key (optional fallback/provider)
- Qdrant and Exa credentials when using those integrations

### Installation

Clone the repository and install the workspace dependencies:

~~~bash
git clone https://github.com/shashank-poola/openmerge.git
cd openmerge
bun install
~~~

Start the local PostgreSQL and Redis services:

~~~bash
docker compose up -d
~~~

Generate the Prisma client and apply the existing migrations:

~~~bash
bun --cwd packages/database run generate
bun --cwd packages/database run db:migrate:deploy
~~~

### Create the GitHub App

In GitHub, go to **Settings → Developer settings → GitHub Apps** and create an app with:

- **Webhook URL:** `https://<your-public-api>/api/v1/webhook/github`
- **Webhook secret:** a value you also set as `GITHUB_WEBHOOK_SECRET`
- **Repository permissions:**
  - Contents: Read-only
  - Metadata: Read-only
  - Issues: Read and write
  - Pull requests: Read-only
- **Subscribe to events:**
  - Installation
  - Pull request

Generate a private key and note the App ID, Client ID, and Client Secret. For local development, expose the API with [ngrok](https://ngrok.com/) or another HTTPS tunnel, then use the public URL in the GitHub App webhook settings.

### Environment Variables

The server validates its environment at startup. Create `apps/server/.env` with the values for your GitHub OAuth App, GitHub App, database, queue, and model provider:

~~~dotenv
PORT=8000
SERVER_JWT_SECRET=replace-with-a-long-random-secret

DATABASE_URL=postgresql://openmerge:password@localhost:5433/openmerge_db
REDIS_URL=redis://localhost:6379

GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SERVER=...
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback

GITHUB_APP_ID=...
GITHUB_APP_NAME=openmerge-app
GITHUB_APP_CLIENT_ID=...
GITHUB_APP_CLIENT_SECRET=...
GITHUB_WEBHOOK_SECRET=...
GITHUB_PRIVATE_KEY=...

GROQ_API_KEY=...
GEMINI_API_KEY=...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
~~~

Keep the private key in the format expected by the application, with escaped newlines when it is stored in a single environment variable. Do not commit secrets.

The worker also needs `DATABASE_URL` and `REDIS_URL`. Put those values in `apps/worker/.env` if they are not available through the environment used to start the worker. The web app needs `NEXT_PUBLIC_API_URL` in `apps/web/.env`.

### Run the Applications

Start the web app, API server, and review worker together:

~~~bash
bun run dev
~~~

Open the dashboard at [http://localhost:3000](http://localhost:3000). The API runs on [http://localhost:8000](http://localhost:8000).

To run one workspace at a time:

~~~bash
bun run dev --filter=web
bun run dev --filter=server
bun run dev --filter=worker
~~~

The API webhook endpoint is:

~~~text
POST /api/v1/webhook/github
~~~

### Checks and Tests

~~~bash
bun run lint
bun run typecheck
bun run test
bun run build
~~~

## Project Structure

| Package | Responsibility |
| --- | --- |
| `apps/web` | Next.js dashboard and documentation site. |
| `apps/server` | Express API, GitHub OAuth, webhook ingestion, and review graph. |
| `apps/worker` | BullMQ worker that executes queued reviews. |
| `packages/database` | Prisma schema, migrations, and PostgreSQL client. |
| `packages/redis` | Shared Redis client utilities. |

## Contributing

Issues and pull requests are welcome. Keep changes focused, validate inputs at service boundaries, and add or update tests when behavior changes. Before opening a pull request, run the relevant lint, typecheck, build, and test commands.

## License

OpenMerge is released under the [MIT License](LICENSE).

<p align="center">
  Built for teams that want calmer, more informed pull-request reviews.
</p>
