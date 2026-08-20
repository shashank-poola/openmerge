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
    expect(parseRedisUrl("redis://review%2Fer:p%40ss@cache.internal:6380")).toEqual({
      host: "cache.internal",
      port: 6380,
      username: "review/er",
      password: "p@ss",
    });
  });

  test("omits the default username and rejects malformed URLs", () => {
    expect(parseRedisUrl("redis://default:secret@localhost:6379")).toEqual({
      host: "localhost",
      port: 6379,
      password: "secret",
    });
    expect(() => parseRedisUrl("not a redis url")).toThrow();
  });

  test("enables TLS for rediss URLs and rejects unsupported schemes", () => {
    expect(parseRedisUrl("rediss://secure-cache.internal:6380")).toEqual({
      host: "secure-cache.internal",
      port: 6380,
      tls: {},
    });
    expect(() => parseRedisUrl("https://cache.internal:6380")).toThrow("Unsupported Redis protocol: https:");
  });
});
