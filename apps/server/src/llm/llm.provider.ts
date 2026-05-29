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
    if (hasOpenRouter()) {
        try {
            const response = await openRouterForTask(task).invoke(messages);
            return { content: response.content as string, provider: "openrouter" };
        } catch (err) {
            console.warn(`OpenRouter failed for [${task}], falling back to Groq:`, (err as Error).message);
        }
    }

    const response = await groqForTask(task).invoke(messages);
    return { content: response.content as string, provider: "groq" };
};

export const getLLM = (task: Task = "codeReview") => ({
    primary: hasOpenRouter() ? openRouterForTask(task) : groqForTask(task),
    fallback: groqForTask(task),
});
