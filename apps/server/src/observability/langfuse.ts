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

let spanProcessor: LangfuseSpanProcessor | null = null;
let tracerRegistered = false;

export const isLangfuseEnabled = (): boolean =>
    Boolean(env.LANGFUSE_PUBLIC_KEY && env.LANGFUSE_SECRET_KEY);

const ensureTracerProvider = (): void => {
    if (tracerRegistered || !isLangfuseEnabled()) return;
    tracerRegistered = true;

    spanProcessor = new LangfuseSpanProcessor({
        publicKey: env.LANGFUSE_PUBLIC_KEY,
        secretKey: env.LANGFUSE_SECRET_KEY,
        baseUrl: env.LANGFUSE_BASE_URL,
        environment: env.LANGFUSE_TRACING_ENVIRONMENT,
    });

    new NodeTracerProvider({ spanProcessors: [spanProcessor] }).register();
};

export const langfuseCallbacks = (): BaseCallbackHandler[] => {
    if (!isLangfuseEnabled()) return [];
    ensureTracerProvider();
    return [new CallbackHandler()];
};

export const withReviewTrace = <T>(trace: ReviewTrace, fn: () => Promise<T>): Promise<T> => {
    if (!isLangfuseEnabled()) return fn();
    ensureTracerProvider();

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
};

export const flushLangfuse = async (): Promise<void> => {
    try {
        await spanProcessor?.forceFlush();
    } catch (error) {
        console.warn("[langfuse] flush failed:", (error as Error).message);
    }
};

export const shutdownLangfuse = async (): Promise<void> => {
    try {
        await spanProcessor?.shutdown();
    } catch (error) {
        console.warn("[langfuse] shutdown failed:", (error as Error).message);
    } finally {
        spanProcessor = null;
    }
};
