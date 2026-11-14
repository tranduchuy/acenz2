import net from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import express from "express";
import { startServer } from "./server";

const closers: Array<() => void> = [];
afterEach(() => {
  while (closers.length) closers.pop()!();
});

describe("startServer", () => {
  it("resolves once listening", async () => {
    const server = await startServer(express(), 0);
    closers.push(() => server.close());
    expect(server.listening).toBe(true);
  });

  it("rejects when the port is already in use", async () => {
    const blocker = net.createServer();
    await new Promise<void>((r) => blocker.listen(0, r));
    closers.push(() => blocker.close());
    const port = (blocker.address() as net.AddressInfo).port;
    await expect(startServer(express(), port)).rejects.toMatchObject({ code: "EADDRINUSE" });
  });
});
