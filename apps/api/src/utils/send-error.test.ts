import type { Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { sendError } from "./send-error";

describe("sendError", () => {
  it("sets the status and sends only the code", () => {
    const json = vi.fn();
    const status = vi.fn(() => ({ json }));
    sendError({ status } as unknown as Response, 403, "SOME_CODE");
    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ code: "SOME_CODE" });
  });
});
