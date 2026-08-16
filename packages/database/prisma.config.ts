import { existsSync } from "fs";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "prisma/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPaths = [
    resolve(__dirname, ".env.local"),
    resolve(__dirname, ".env"),
    resolve(__dirname, "../../.env.local"),
    resolve(__dirname, "../../.env"),
];

for (const envPath of envPaths) {
    if (existsSync(envPath)) {
        config({ path: envPath });
    }
}

export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
    },
    datasource: {
        url: process.env.DATABASE_URL!,
    },
});
