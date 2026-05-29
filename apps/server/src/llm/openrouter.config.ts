import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env.config";
import { OPENROUTER_DEFAULTS } from "./models/openrouter.models";

const BASE_URL = "https://openrouter.ai/api/v1";
const HEADERS = {
    "HTTP-Referer": "https://pullrabbit.com",
    "X-Title": "PullRabbit",
};

export const hasOpenRouter = (): boolean => Boolean(env.OPENROUTER_API_KEY);

export const openRouterForTask = (task: keyof typeof OPENROUTER_DEFAULTS) => {
    if (!env.OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY not set");
    return new ChatOpenAI({
        apiKey: env.OPENROUTER_API_KEY,
        modelName: OPENROUTER_DEFAULTS[task],
        temperature: 0.1,
        configuration: {
            baseURL: BASE_URL,
            defaultHeaders: HEADERS,
        },
    });
};
