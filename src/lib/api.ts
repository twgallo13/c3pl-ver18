// Collab3PL V18 — API Client Scaffold
// Uses Zod contracts to validate responses.

import { z } from "zod";

// Generic API error shape
export class APIError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "APIError";
    this.status = status;
    this.details = details;
  }
}

// Core wrapper
async function request<T extends z.ZodTypeAny>(
  url: string,
  opts: RequestInit = {},
  schema?: T
): Promise<z.infer<T>> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

  const text = await res.text();
  let data: unknown = undefined;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    throw new APIError("Invalid JSON in response", res.status, text);
  }

  if (!res.ok) {
    throw new APIError(res.statusText, res.status, data);
  }

  if (schema) {
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      throw new APIError("Schema validation failed", res.status, parsed.error);
    }
    return parsed.data;
  }

  // @ts-expect-error if caller didn't pass schema
  return data;
}

// Convenience helpers
export const api = {
  get: <T extends z.ZodTypeAny>(url: string, schema?: T) =>
    request<T>(url, { method: "GET" }, schema),
  post: <T extends z.ZodTypeAny>(url: string, body: unknown, schema?: T) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }, schema),
};