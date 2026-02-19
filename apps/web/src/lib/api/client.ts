import axios, { InternalAxiosRequestConfig } from "axios";
import { emitUnauthorized } from "@lib/auth/auth-events";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const authClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshRequest: Promise<void> | null = null;

function shouldSkipRefresh(url?: string) {
  return (
    url === "/auth/login" || url === "/auth/register" || url === "/auth/refresh"
  );
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status as number | undefined;
    const requestUrl = error?.config?.url as string | undefined;
    const originalRequest = (error?.config ?? null) as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | null;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefresh(requestUrl)
    ) {
      originalRequest._retry = true;

      if (!refreshRequest) {
        refreshRequest = authClient
          .post("/auth/refresh")
          .then(() => undefined)
          .finally(() => {
            refreshRequest = null;
          });
      }

      try {
        await refreshRequest;
        return apiClient(originalRequest);
      } catch (refreshError) {
        const refreshStatus = axios.isAxiosError(refreshError)
          ? refreshError.response?.status
          : undefined;

        if (refreshStatus === 401) {
          emitUnauthorized();
        }

        return Promise.reject(error);
      }
    }

    if (
      status === 401 &&
      requestUrl !== "/auth/login" &&
      requestUrl !== "/auth/register" &&
      requestUrl !== "/auth/refresh"
    ) {
      emitUnauthorized();
    }

    return Promise.reject(error);
  },
);
