import { mock } from "bun:test";

export function createMockResponse() {
  const res: any = {
    statusCode: 200,
    body: undefined,
    redirectUrl: undefined,
    status: mock((code: number) => {
      res.statusCode = code;
      return res;
    }),
    json: mock((body: unknown) => {
      res.body = body;
      return res;
    }),
    redirect: mock((url: string) => {
      res.redirectUrl = url;
      return res;
    }),
  };

  return res;
}

export function createMockRequest(overrides: Record<string, unknown> = {}) {
  return {
    headers: {},
    body: {},
    query: {},
    ...overrides,
  } as any;
}
