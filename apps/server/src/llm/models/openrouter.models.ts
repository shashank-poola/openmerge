export const OPENROUTER_MODELS = {
    NEMOTRON_3_SUPER:  "nvidia/nemotron-3-super-120b:free",
    LAGUNA_M1:         "poolside/laguna-m1:free",
    GPT_OSS_120B:      "openai/gpt-oss-120b:free",
    GLM_4_5_AIR:       "z.ai/glm-4.5-air:free",
    LLAMA_3_3_70B:     "meta-llama/llama-3.3-70b-instruct:free",
    DEEPSEEK_R1:       "deepseek/deepseek-r1:free",
    QWEN3_235B:        "qwen/qwen3-235b-a22b:free",
} as const;

export type OpenRouterModel = (typeof OPENROUTER_MODELS)[keyof typeof OPENROUTER_MODELS];

export const OPENROUTER_DEFAULTS = {
    codeReview:  OPENROUTER_MODELS.NEMOTRON_3_SUPER,
    security:    OPENROUTER_MODELS.NEMOTRON_3_SUPER,
    performance: OPENROUTER_MODELS.LAGUNA_M1,
    fast:        OPENROUTER_MODELS.LLAMA_3_3_70B,
} as const;
