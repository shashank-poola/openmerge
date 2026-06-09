import type { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import { hasOpenRouter, openRouterForTask } from "./openrouter.config";
import { groqForTask } from "./groq.config";
import type { OPENROUTER_DEFAULTS } from "./models/openrouter.models";
import type { GROQ_DEFAULTS } from "./models/groq.models";

type Task = keyof typeof OPENROUTER_DEFAULTS & keyof typeof GROQ_DEFAULTS;

export const invokeLLM = async (
    messages: BaseLanguageModelInput,
    task: Task = "codeReview"
): Promise<{ content: string; provider: "openrouter" | "groq" }> => {
    try {
        const response = await groqForTask(task).invoke(messages);
        return { content: response.content as string, provider: "groq" };
    } catch (err) {
        console.warn(`Groq failed for [${task}], falling back to OpenRouter:`, (err as Error).message);
    }

    if (hasOpenRouter()) {
        const response = await openRouterForTask(task).invoke(messages);
        return { content: response.content as string, provider: "openrouter" };
    }

    throw new Error(`All LLM providers failed for task: ${task}`);
};

export const getLLM = (task: Task = "codeReview") => ({
    primary: groqForTask(task),
    fallback: hasOpenRouter() ? openRouterForTask(task) : groqForTask(task),
});
