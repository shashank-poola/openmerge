export const GROQ_MODELS = {
    LLAMA_3_3_70B:   "llama-3.3-70b-versatile",
    LLAMA_3_1_8B:    "llama-3.1-8b-instant",
    DEEPSEEK_R1_70B: "deepseek-r1-distill-llama-70b",
    MIXTRAL_8X7B:    "mixtral-8x7b-32768",
} as const;

export type GroqModel = (typeof GROQ_MODELS)[keyof typeof GROQ_MODELS];

export const GROQ_DEFAULTS = {
    codeReview:  GROQ_MODELS.LLAMA_3_3_70B,
    security:    GROQ_MODELS.LLAMA_3_3_70B,
    performance: GROQ_MODELS.LLAMA_3_3_70B,
    fast:        GROQ_MODELS.LLAMA_3_1_8B,
} as const;
