import { ChatGroq } from "@langchain/groq";
import { env } from "./env.config";

export const groq = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
});

export const groqFast = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
});
