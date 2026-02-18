import axios from "axios";
import { emitUnauthorized } from "@lib/auth/auth-events";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status as number | undefined;
    const requestUrl = error?.config?.url as string | undefined;

    if (
      status === 401 &&
      requestUrl !== "/auth/login" &&
      requestUrl !== "/auth/register"
    ) {
      emitUnauthorized();
    }

    return Promise.reject(error);
  },
);
