import { mock } from "bun:test";
import type { Request, Response } from "express";

export type MockRequest = Request & {
  headers: Record<string, string>;
  body: Record<string, unknown>;
  query: Record<string, unknown>;
  rawBody?: Buffer;
  user?: {
    userId: string;
    email: string;
  };
  userId?: string;
};

type RedirectFn = {
  (url: string): MockResponse;
  (status: number, url: string): MockResponse;
};

export type MockResponse = Omit<Response, "status" | "json" | "redirect"> & {
  statusCode: number;
  body: unknown;
  redirectUrl: string | undefined;
  status: ReturnType<typeof mock<(code: number) => MockResponse>>;
  json: ReturnType<typeof mock<(body: unknown) => MockResponse>>;
  redirect: RedirectFn & ReturnType<typeof mock<(statusOrUrl: number | string, url?: string) => MockResponse>>;
};

export function createMockResponse(): MockResponse {
  const res = {} as unknown as MockResponse;

  res.statusCode = 200;
  res.body = undefined;
  res.redirectUrl = undefined;
  res.status = mock<(code: number) => MockResponse>((code) => {
    res.statusCode = code;
    return res;
  });
  res.json = mock<(body: unknown) => MockResponse>((body) => {
    res.body = body;
    return res;
  });
  res.redirect = mock<(statusOrUrl: number | string, url?: string) => MockResponse>((statusOrUrl, url) => {
    res.redirectUrl = typeof statusOrUrl === "string" ? statusOrUrl : url;
    return res;
  }) as MockResponse["redirect"];

  return res;
}

export function createMockRequest(overrides: Partial<MockRequest> = {}): MockRequest {
  return {
    headers: {},
    body: {},
    query: {},
    ...overrides,
  } as unknown as MockRequest;
}
