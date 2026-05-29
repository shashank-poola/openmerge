import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({
    path: path.resolve(process.cwd(), "../../.env"),
})

const envSchema = z.object({
    PORT: z.string().default("8000").transform(Number),
    SERVER_JWT_SECRET: z.string().min(1),
    DATABASE_URL: z.url(),
    GITHUB_CLIENT_ID: z.string().min(1),
    GITHUB_CLIENT_SERVER: z.string().min(1),
    GITHUB_CALLBACK_URL: z.url(),
    GITHUB_APP_ID: z.string().min(1),
    GITHUB_APP_NAME: z.string().min(1),
    GITHUB_APP_CLIENT_ID: z.string().min(1),
    GITHUB_APP_CLIENT_SECRET: z.string().min(1),
    GITHUB_WEBHOOK_SECRET: z.string().min(1),
    GITHUB_PRIVATE_KEY: z.string().min(1),
    REDIS_URL: z.url().optional(),
    EMBED_MODEL: z.string().optional(),
    QDRANT_URL: z.url().optional(),
    QDRANT_CLUSTER_ID: z.string().optional(),
    GROQ_API_KEY: z.string().min(1),
    GOOGLE_GEMINI_API: z.string().optional(),
    EXA_API: z.string().optional(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_API_URL: z.string().optional(),
  });
  
export const env = envSchema.parse(process.env);