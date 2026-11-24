import { RegisterRequestSchema } from "@acenz/shared";
import { registerErrorMessage, type RegisterField } from "./register-messages";

export type RegisterErrors = Partial<Record<RegisterField, string>>;

/**
 * Checks the form with the same schema the server uses, so the user sees every problem at once
 * (one message per field, the first by the server's order) instead of one per round trip.
 */
export function validateRegister(values: Record<RegisterField, string>): RegisterErrors {
  const result = RegisterRequestSchema.safeParse(values);
  const errors: RegisterErrors = {};
  if (result.success) return errors;
  for (const issue of result.error.issues) {
    const { field, message } = registerErrorMessage(issue.message);
    if (field !== "form" && errors[field] === undefined) errors[field] = message;
  }
  return errors;
}
