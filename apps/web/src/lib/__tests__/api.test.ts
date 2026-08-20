import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { installationCallback, getMe } from "../api";
import { INSTALLATIONS_CALLBACK_URL, ME_URL } from "@/routes/apiRoute";

type FetchFn = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

const fetchMock = mock<FetchFn>(async () => new Response(null, { status: 500 }));
const originalFetch = globalThis.fetch;

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("web api helpers", () => {
  test("getMe sends the bearer token and returns parsed user data", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      success: true,
      user: {
        id: "user-1",
        githubUserId: "123",
        githubLogin: "octocat",
        email: "octocat@github.com",
        name: "Octo Cat",
        avatarUrl: "https://avatars.githubusercontent.com/u/123?v=4",
      },
    }), { status: 200 }));

    const result = await getMe("session-token");

    expect(fetchMock).toHaveBeenCalledWith(ME_URL, {
      headers: { Authorization: "Bearer session-token" },
    });
    expect(result).toMatchObject({ success: true, user: { githubLogin: "octocat" } });
  });

  test("getMe throws on non-OK responses", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(getMe("bad-token")).rejects.toThrow("getMe failed: 401");
  });

  test("installationCallback posts the installation id payload", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));

    const result = await installationCallback("session-token", "98765");

    expect(fetchMock).toHaveBeenCalledWith(INSTALLATIONS_CALLBACK_URL, {
      method: "POST",
      headers: {
        Authorization: "Bearer session-token",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ installationId: "98765" }),
    });
    expect(result).toEqual({ success: true });
  });
});
