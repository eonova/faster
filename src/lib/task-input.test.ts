import { describe, expect, it } from "vite-plus/test";

import { parseTaskInput } from "./task-input";

describe("parseTaskInput", () => {
  it("trims and accepts a valid task", () => {
    expect(parseTaskInput({ title: "  Try Devframe  ", priority: "high" })).toEqual({
      title: "Try Devframe",
      priority: "high",
    });
  });

  it("rejects a missing or malformed object", () => {
    expect(() => parseTaskInput(null)).toThrow(/object/i);
    expect(() => parseTaskInput("task")).toThrow(/object/i);
  });

  it("rejects invalid titles and priorities", () => {
    expect(() => parseTaskInput({ title: "x", priority: "high" })).toThrow(/title/i);
    expect(() => parseTaskInput({ title: "Valid title", priority: "urgent" })).toThrow(/priority/i);
  });
});
