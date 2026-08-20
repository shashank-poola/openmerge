export function setupTestEnv(overrides: Record<string, string> = {}) {
  Object.assign(process.env, {
    NODE_ENV: "test",
    PORT: "8000",
    SERVER_JWT_SECRET: "test-server-secret-minimum-entropy",
    DATABASE_URL: "postgresql://pullrabbit:pullrabbit@localhost:5432/pullrabbit_test",
    GITHUB_CLIENT_ID: "github-client-id",
    GITHUB_CLIENT_SERVER: "github-client-secret",
    GITHUB_CALLBACK_URL: "http://localhost:3000/auth/github/callback",
    GITHUB_APP_ID: "12345",
    GITHUB_APP_NAME: "pullrabbit-test",
    GITHUB_APP_CLIENT_ID: "github-app-client-id",
    GITHUB_APP_CLIENT_SECRET: "github-app-client-secret",
    GITHUB_WEBHOOK_SECRET: "webhook-secret",
    GITHUB_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----",
    GROQ_API_KEY: "groq-test-key",
    ...overrides,
  });
}
