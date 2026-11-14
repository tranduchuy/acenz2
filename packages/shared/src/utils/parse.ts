import type { z } from "zod";

export class SchemaValidationError extends Error {
  readonly issues: z.core.$ZodIssue[];

  constructor(issues: z.core.$ZodIssue[]) {
    super(`Schema validation failed: ${issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
    this.name = "SchemaValidationError";
    this.issues = issues;
  }
}

export function parseOrThrow<S extends z.ZodType>(schema: S, data: unknown): z.infer<S> {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new SchemaValidationError(result.error.issues);
  }
  return result.data;
}
