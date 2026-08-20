import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import type { NextFunction, Request, Response } from "express";
import { requestLogger } from "../logger.middleware";

function createLoggerResponse(statusCode: number) {
  let finishListener: (() => void) | undefined;

  const res = {
    statusCode,
    on(event: string, listener: () => void) {
      if (event === "finish") {
        finishListener = listener;
      }
      return res;
    },
    emitFinish() {
      finishListener?.();
    },
  } as unknown as Response & {
    emitFinish: () => void;
  };

  return res;
}

describe("requestLogger", () => {
  const consoleLogMock = mock<(message?: unknown, ...optionalParams: unknown[]) => void>(() => undefined);
  const originalConsoleLog = console.log;

  beforeEach(() => {
    console.log = consoleLogMock;
    consoleLogMock.mockClear();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  test("calls next immediately and logs completed requests", () => {
    const req = {
      method: "POST",
      originalUrl: "/api/v1/auth/signin",
    } as Request;
    const res = createLoggerResponse(201);
    const next = mock<(deferToNext?: "route" | "router") => void>(() => undefined);

    requestLogger(req, res, next as unknown as NextFunction);
    res.emitFinish();

    expect(next).toHaveBeenCalledTimes(1);
    expect(consoleLogMock).toHaveBeenCalledTimes(1);
    expect(String(consoleLogMock.mock.calls[0]?.[0])).toContain("/api/v1/auth/signin");
    expect(String(consoleLogMock.mock.calls[0]?.[0])).toContain("201");
    expect(String(consoleLogMock.mock.calls[0]?.[0])).toContain("POST");
  });
});
