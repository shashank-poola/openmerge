import { describe, expect, test } from "bun:test";
import { parseRedisUrl } from "../worker.utils";

describe("parseRedisUrl", () => {
  test("parses host, port, username, and decoded password from Redis URLs", () => {
    expect(parseRedisUrl("redis://reviewer:p%40ss@cache.internal:6380")).toEqual({
      host: "cache.internal",
      port: 6380,
      username: "reviewer",
      password: "p@ss",
    });
  });

  test("omits the default username and falls back to localhost defaults for invalid URLs", () => {
    expect(parseRedisUrl("redis://default:secret@localhost:6379")).toEqual({
      host: "localhost",
      port: 6379,
      password: "secret",
    });
    expect(parseRedisUrl("not a redis url")).toEqual({ host: "127.0.0.1", port: 6379 });
  });
});
