export const GROQ_MODELS = {
    GPT_OSS_120B: "openai/gpt-oss-120b",
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

export const GROQ_DEFAULTS = {
    codeReview:  GROQ_MODELS.GPT_OSS_120B,
    security:    GROQ_MODELS.GPT_OSS_120B,
    performance: GROQ_MODELS.GPT_OSS_120B,
    verification: GROQ_MODELS.GPT_OSS_120B,
    fast:        GROQ_MODELS.GPT_OSS_120B,
    summary:     GROQ_MODELS.GPT_OSS_120B,
} as const;
