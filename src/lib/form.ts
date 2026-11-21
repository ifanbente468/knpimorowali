import type { ZodError } from "zod";

export type ActionState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

export const initialActionState: ActionState = { ok: false };

export function fail(message: string, error?: ZodError): ActionState {
  return {
    ok: false,
    message,
    fieldErrors: error ? collectFieldErrors(error) : undefined,
  };
}

export function success(message: string): ActionState {
  return { ok: true, message };
}

export function collectFieldErrors(error: ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "_form";
    fieldErrors[key] = [...(fieldErrors[key] ?? []), issue.message];
  }
  return fieldErrors;
}

export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readOptionalString(formData: FormData, key: string) {
  const value = readString(formData, key);
  return value.length ? value : undefined;
}

export function readBoolean(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function readNumber(formData: FormData, key: string) {
  const value = readString(formData, key).replace(/[^\d-]/g, "");
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function readDate(formData: FormData, key: string) {
  const value = readString(formData, key);
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}
