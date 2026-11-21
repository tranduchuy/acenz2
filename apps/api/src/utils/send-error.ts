import type { Response } from "express";

/** Sends `{ code }` with the given status. Shared by every route/controller so error bodies stay uniform. */
export function sendError<C extends string>(res: Response, status: number, code: C): void {
  res.status(status).json({ code });
}
