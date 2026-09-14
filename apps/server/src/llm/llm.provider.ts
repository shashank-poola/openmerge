import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { groqForTask } from "./groq.config";
import { geminiForTask, hasGemini } from "./gemini.config";
import { langfuseCallbacks } from "../observability/langfuse";
import type { LLMTraceOptions } from "./llm.trace";
import type { GROQ_DEFAULTS } from "./models/groq.models";

type Task = keyof typeof GROQ_DEFAULTS;

const buildConfig = (task: Task, provider: "groq" | "gemini", options?: LLMTraceOptions) => ({
    runName: options?.runName ?? `${task}-${provider}`,
    tags: [`task:${task}`, `provider:${provider}`, ...(options?.tags ?? [])],
    metadata: { task, provider, ...(options?.metadata ?? {}) },
    callbacks: langfuseCallbacks(),
});

export const invokeLLM = async (
    messages: BaseLanguageModelInput,
    task: Task = "codeReview",
    options?: LLMTraceOptions
): Promise<{ content: string; provider: "groq" | "gemini" }> => {
    if (hasGemini()) {
        try {
            const response = await geminiForTask(task).invoke(
                messages,
                buildConfig(task, "gemini", options)
            );
            return { content: response.content as string, provider: "gemini" };
        } catch (err) {
            console.warn(`Gemini failed for [${task}], falling back to Groq:`, (err as Error).message);
        }
    }

    try {
        const response = await groqForTask(task).invoke(
            messages,
            buildConfig(task, "groq", options)
        );
        return { content: response.content as string, provider: "groq" };
    } catch (err) {
        console.warn(`Groq failed for [${task}]:`, (err as Error).message);
        throw new Error(`All LLM providers failed for task: ${task}`);
    }
};

export const getLLM = (task: Task = "codeReview") => ({
    primary: hasGemini() ? geminiForTask(task) : groqForTask(task),
    fallback: groqForTask(task),
});
