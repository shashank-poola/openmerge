import { ChatGroq } from "@langchain/groq";
import { env } from "../config/env.config";
import { GROQ_DEFAULTS } from "./models/groq.models";

export const groq = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: GROQ_DEFAULTS.codeReview,
    temperature: 0.1,
});

export const groqFast = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: GROQ_DEFAULTS.fast,
    temperature: 0.1,
});

export const groqForTask = (task: keyof typeof GROQ_DEFAULTS) =>
    new ChatGroq({
        apiKey: env.GROQ_API_KEY,
        model: GROQ_DEFAULTS[task],
        temperature: 0.1,
    });
