import type { BaseCallbackHandler } from "@langchain/core/callbacks/base";
import { CallbackHandler } from "@langfuse/langchain";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { propagateAttributes } from "@langfuse/tracing";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { env } from "../config/env.config";

export type ReviewTrace = {
    reviewSessionId: string;
    owner: string;
    repoName: string;
    prNumber: number;
    headSha?: string;
};

/** Upper bound on how long a review job may wait for spans to reach Langfuse. */
const FLUSH_TIMEOUT_MS = 5_000;

let spanProcessor: LangfuseSpanProcessor | null = null;
let setupState: "pending" | "ready" | "failed" | "shutdown" = "pending";

const warn = (action: string, error: unknown): void => {
    console.warn(`[langfuse] ${action} failed:`, (error as Error).message);
};

const hasCredentials = (): boolean =>
    Boolean(env.LANGFUSE_PUBLIC_KEY && env.LANGFUSE_SECRET_KEY);

export const isLangfuseEnabled = (): boolean =>
    hasCredentials() && setupState !== "failed" && setupState !== "shutdown";

/**
 * Registers the Langfuse span processor as the global tracer provider on first use.
 * Any setup failure permanently disables tracing instead of breaking the review.
 */
const ensureTracerProvider = (): boolean => {
    if (setupState !== "pending") return setupState === "ready";
    if (!hasCredentials()) return false;

    try {
        spanProcessor = new LangfuseSpanProcessor({
            publicKey: env.LANGFUSE_PUBLIC_KEY,
            secretKey: env.LANGFUSE_SECRET_KEY,
            baseUrl: env.LANGFUSE_BASE_URL,
            environment: env.LANGFUSE_TRACING_ENVIRONMENT,
        });

        new NodeTracerProvider({ spanProcessors: [spanProcessor] }).register();
        setupState = "ready";
    } catch (error) {
        warn("setup", error);
        spanProcessor = null;
        setupState = "failed";
    }

    return setupState === "ready";
};

export const langfuseCallbacks = (): BaseCallbackHandler[] => {
    if (!ensureTracerProvider()) return [];

    try {
        return [new CallbackHandler()];
    } catch (error) {
        warn("callback handler", error);
        return [];
    }
};

/**
 * Runs `fn` with the trace attributes every LLM call of a review inherits, so one
 * review lands in one Langfuse trace keyed by `reviewSessionId`.
 */
export const withReviewTrace = <T>(trace: ReviewTrace, fn: () => Promise<T>): Promise<T> => {
    if (!ensureTracerProvider()) return fn();

    try {
        return propagateAttributes(
            {
                traceName: "pr-review",
                sessionId: trace.reviewSessionId,
                tags: [`repo:${trace.owner}/${trace.repoName}`, `pr:${trace.prNumber}`],
                metadata: {
                    reviewSessionId: trace.reviewSessionId,
                    repository: `${trace.owner}/${trace.repoName}`,
                    prNumber: String(trace.prNumber),
                    ...(trace.headSha ? { headSha: trace.headSha } : {}),
                },
            },
            fn,
        );
    } catch (error) {
        warn("trace propagation", error);
        return fn();
    }
};

/** Exports buffered spans. Never waits longer than FLUSH_TIMEOUT_MS on an unreachable Langfuse. */
export const flushLangfuse = async (): Promise<void> => {
    if (!spanProcessor) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        await Promise.race([
            spanProcessor.forceFlush(),
            new Promise<void>((resolve) => {
                timer = setTimeout(resolve, FLUSH_TIMEOUT_MS);
            }),
        ]);
    } catch (error) {
        warn("flush", error);
    } finally {
        clearTimeout(timer);
    }
};

export const shutdownLangfuse = async (): Promise<void> => {
    const processor = spanProcessor;
    spanProcessor = null;
    // The global tracer provider cannot be replaced, so tracing stays off after shutdown.
    setupState = "shutdown";
    if (!processor) return;

    try {
        await processor.shutdown();
    } catch (error) {
        warn("shutdown", error);
    }
};
