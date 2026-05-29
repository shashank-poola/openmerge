import type { Request, Response, NextFunction } from "express";

const STATUS_COLOR = (status: number): string => {
    if (status >= 500) return "\x1b[31m";
    if (status >= 400) return "\x1b[33m";
    if (status >= 300) return "\x1b[36m";
    return "\x1b[32m";
};

const METHOD_COLOR = (method: string): string => {
    const colors: Record<string, string> = {
        GET:    "\x1b[34m",
        POST:   "\x1b[35m",
        PATCH:  "\x1b[33m",
        DELETE: "\x1b[31m",
        PUT:    "\x1b[36m",
    };
    return colors[method] ?? "\x1b[37m";
};

const RESET = "\x1b[0m";
const DIM   = "\x1b[2m";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    res.on("finish", () => {
        const ms      = Date.now() - start;
        const method  = req.method.padEnd(6);
        const status  = res.statusCode;
        const path    = req.originalUrl;

        console.log(
            `${METHOD_COLOR(req.method)}${method}${RESET} ` +
            `${STATUS_COLOR(status)}${status}${RESET} ` +
            `${path} ` +
            `${DIM}${ms}ms${RESET}`
        );
    });

    next();
};
