export type RedisConnection = {
  host: string;
  port: number;
  password?: string;
  username?: string;
};

export function parseRedisUrl(url: string): RedisConnection {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || "127.0.0.1",
      port: Number(parsed.port) || 6379,
      ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
      ...(parsed.username && parsed.username !== "default" ? { username: parsed.username } : {}),
    };
  } catch {
    return { host: "127.0.0.1", port: 6379 };
  }
}
