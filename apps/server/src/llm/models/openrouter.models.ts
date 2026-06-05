export const OPENROUTER_MODELS = {
    QWEN3_235B:        "qwen/qwen3-235b-a22b:free",
    DEEPSEEK_R1:       "deepseek/deepseek-r1:free",
    LLAMA_3_3_70B:     "meta-llama/llama-3.3-70b-instruct:free",
    DEEPSEEK_V3:       "deepseek/deepseek-chat-v3-5:free",
    GEMMA_3_27B:       "google/gemma-3-27b-it:free",
} as const;

export type OpenRouterModel = (typeof OPENROUTER_MODELS)[keyof typeof OPENROUTER_MODELS];

export const OPENROUTER_DEFAULTS = {
    codeReview:  OPENROUTER_MODELS.QWEN3_235B,
    security:    OPENROUTER_MODELS.DEEPSEEK_R1,
    performance: OPENROUTER_MODELS.LLAMA_3_3_70B,
    fast:        OPENROUTER_MODELS.LLAMA_3_3_70B,
} as const;
