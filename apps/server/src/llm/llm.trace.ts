/** Tracing hints attached to an LLM call so it is identifiable in Langfuse. */
export type LLMTraceOptions = {
    runName?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
};

/** Labels a call with its agent while keeping the trace metadata the caller supplied. */
export const agentTrace = (
    runName: string,
    agentTag: string,
    trace?: LLMTraceOptions
): LLMTraceOptions => ({
    runName,
    tags: [agentTag, ...(trace?.tags ?? [])],
    metadata: trace?.metadata,
});
