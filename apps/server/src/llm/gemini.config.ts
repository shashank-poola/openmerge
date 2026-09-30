import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { env } from "../config/env.config";
import type { GROQ_DEFAULTS } from "./models/groq.models";

const GEMINI_MODEL = "gemini-2.5-flash";

export const hasGemini = (): boolean => Boolean(env.GEMINI_API_KEY);

export const geminiForTask = (_task: keyof typeof GROQ_DEFAULTS) => {
    if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set");

    return new ChatGoogleGenerativeAI({
        apiKey: env.GEMINI_API_KEY,
        model: GEMINI_MODEL,
        temperature: 0.1,
        ...( _task === "verification" ? { maxOutputTokens: 6_000, maxRetries: 0 } : {}),
    });
};
