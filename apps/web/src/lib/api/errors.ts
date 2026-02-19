import axios from "axios";
import { ApiErrorEnvelope } from "./types";

export function normalizeApiError(error: unknown): Error {
  if (!axios.isAxiosError(error)) {
    return new Error("Unexpected error");
  }

  const payload = error.response?.data as ApiErrorEnvelope | undefined;

  if (!payload) {
    return new Error(error.message || "Request failed");
  }

  if (Array.isArray(payload.message)) {
    return new Error(payload.message.join(", "));
  }

  if (typeof payload.message === "string") {
    return new Error(payload.message);
  }

  if (payload.message && typeof payload.message === "object") {
    if ("fieldErrors" in payload.message) {
      return new Error("Validation error. Please check the form fields.");
    }

    return new Error("Invalid request payload");
  }

  return new Error(payload.error || "Request failed");
}
