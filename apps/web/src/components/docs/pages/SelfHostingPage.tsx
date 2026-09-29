import { DocArticle } from "../DocArticle";
import { GITHUB_REPO_URL } from "../docs-nav";
import { A, Callout, Code, CodeBlock, H2, H3, List, P, Table } from "../DocsPrimitives";

const toc = [
  { id: "architecture", label: "Architecture" },
  { id: "github-app", label: "Create a GitHub App" },
  { id: "environment", label: "Environment variables" },
  { id: "local-development", label: "Local development" },
  { id: "production", label: "Production checklist" },
];

const required = (name: string, description: string) => [<Code key={name}>{name}</Code>, "Required", description];
const optional = (name: string, description: string) => [<Code key={name}>{name}</Code>, "Optional", description];

export function SelfHostingPage() {
  return (
    <DocArticle slug="self-hosting" toc={toc}>
      <P className="mt-8">
        OpenMerge is open source under the MIT license. The code is on <A href={GITHUB_REPO_URL}>GitHub</A>, and this page covers what you need to run it yourself.
      </P>

      <H2 id="architecture">Architecture</H2>
      <Table
        headers={["Service", "Role"]}
        rows={[
          [<Code key="w">apps/web</Code>, "Next.js app: landing page, docs, sign-in, and dashboard."],
          [<Code key="s">apps/server</Code>, "Express API: GitHub OAuth, webhook verification, review sessions, and dashboard routes. Queues review jobs."],
          [<Code key="k">apps/worker</Code>, "Processes review jobs: gathers context, runs the agents, and posts to GitHub. Run it separately from the API."],
          ["PostgreSQL", "Users, installations, repositories, review sessions, and findings."],
          ["Redis", "The review job queue."],
        ]}
      />

      <H2 id="github-app">Create a GitHub App</H2>
      <P>Create a GitHub App for your deployment, plus an OAuth app for dashboard sign-in, and point them at your URLs:</P>
      <Table
        headers={["Setting", "Value"]}
        rows={[
          ["Webhook URL", <Code key="wh">{"https://<api-host>/api/v1/webhook/github"}</Code>],
          ["Webhook events", <span key="ev"><Code>Pull request</Code> and <Code>Installation</Code></span>],
          ["Setup URL", <Code key="su">{"https://<web-host>/setup"}</Code>],
          ["OAuth callback URL", <Code key="cb">{"https://<web-host>/auth/github/callback"}</Code>],
        ]}
      />
      <P>
        The app needs to read repository contents and pull requests and to write pull request comments. Generate a private key and a webhook secret, and keep both in your secret manager.
      </P>

      <H2 id="environment">Environment variables</H2>
      <P>
        The API validates its environment at startup and exits with a clear error if something is missing. It reads <Code>apps/server/.env</Code> or a <Code>.env</Code> at the repository root.
      </P>
      <H3>API and worker</H3>
      <Table
        headers={["Variable", "Status", "Description"]}
        rows={[
          required("DATABASE_URL", "PostgreSQL connection string."),
          required("SERVER_JWT_SECRET", "Signs dashboard sessions (valid for seven days)."),
          required("GITHUB_CLIENT_ID", "OAuth app client ID, used for sign-in."),
          required("GITHUB_CLIENT_SERVER", "OAuth app client secret."),
          required("GITHUB_CALLBACK_URL", "The web app's /auth/github/callback URL."),
          required("GITHUB_APP_ID", "GitHub App ID."),
          required("GITHUB_APP_NAME", "GitHub App slug."),
          required("GITHUB_APP_CLIENT_ID", "GitHub App client ID."),
          required("GITHUB_APP_CLIENT_SECRET", "GitHub App client secret."),
          required("GITHUB_WEBHOOK_SECRET", "Verifies X-Hub-Signature-256 on incoming webhooks."),
          required("GITHUB_PRIVATE_KEY", "GitHub App private key (PEM)."),
          required("GROQ_API_KEY", "Model provider used for reviews, and the fallback when Gemini is configured."),
          optional("GEMINI_API_KEY", "When set, Gemini is tried first and Groq is used as the fallback."),
          optional("REDIS_URL", "Defaults to redis://localhost:6379 in development. Required in production."),
          optional("PORT", "API port. Defaults to 8000."),
        ]}
      />
      <H3>Web app</H3>
      <Table
        headers={["Variable", "Status", "Description"]}
        rows={[
          required("NEXT_PUBLIC_API_URL", "Public URL of the API. Defaults to http://localhost:8000."),
          required("NEXT_PUBLIC_APP_URL", "Public URL of the web app."),
        ]}
      />

      <Callout tone="warning" title="Allow your web origin">
        The API only accepts browser requests from the origins listed in <Code>apps/server/src/index.ts</Code>. Add your web app&apos;s URL there, or the dashboard cannot reach the API.
      </Callout>

      <H2 id="local-development">Local development</H2>
      <P>You need Bun and Docker. Start PostgreSQL and Redis, install dependencies, apply migrations, and run everything in watch mode:</P>
      <CodeBlock
        language="bash"
        code={`docker compose up -d                     # PostgreSQL on 5433, Redis on 6379
bun install
cd packages/database && bun run db:migrate:dev && cd ../..
bun run dev                              # web, API, and worker`}
      />
      <Callout tone="note">
        The Compose file publishes PostgreSQL on host port <strong>5433</strong>, so point <Code>DATABASE_URL</Code> at <Code>localhost:5433</Code>.
      </Callout>
      <P>To run a single app, filter by workspace:</P>
      <CodeBlock language="bash" code={`bun run dev --filter=web\nbun run dev --filter=server\nbun run dev --filter=worker`} />

      <H2 id="production">Production checklist</H2>
      <List
        items={[
          "Run the API and the worker as separate, independently restartable services.",
          "Use managed PostgreSQL and Redis with persistent storage and backups.",
          <>Set <Code>NEXT_PUBLIC_APP_URL</Code>, <Code>NEXT_PUBLIC_API_URL</Code>, and <Code>GITHUB_CALLBACK_URL</Code> to their public HTTPS addresses.</>,
          <>Apply migrations on each deploy with <Code>bun --cwd packages/database run db:migrate:deploy</Code>.</>,
          "Add health checks, structured logs, queue monitoring, and alerts for failed jobs.",
          "Rotate any exposed private key, webhook secret, OAuth secret, or model key immediately.",
        ]}
      />
    </DocArticle>
  );
}
