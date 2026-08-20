import { describe, expect, test } from "bun:test";
import { cn } from "../utils";

describe("cn", () => {
  test("merges conditional class names", () => {
    expect(cn("px-2", false && "hidden", "py-3")).toBe("px-2 py-3");
  });

  test("resolves conflicting Tailwind utilities with the last value winning", () => {
    expect(cn("px-2", "px-4", "text-sm", "text-lg")).toBe("px-4 text-lg");
  });
});
