import { create } from "zustand";
import {
  login,
  logoutSession,
  refreshSession,
  register,
  revokeSessions,
} from "@lib/api/auth.api";
import { normalizeApiError } from "@lib/api/errors";
import { AuthUser } from "@lib/api/types";
import { setUnauthorizedHandler } from "./auth-events";

type AuthStatus =
  | "unknown"
  | "refreshing"
  | "authenticated"
  | "unauthenticated";

type Credentials = {
  email: string;
  password: string;
};

type RegisterCredentials = Credentials & {
  name: string;
};

type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  isBootstrapped: boolean;
  bootstrap: () => Promise<void>;
  loginAction: (credentials: Credentials) => Promise<void>;
  registerAction: (credentials: RegisterCredentials) => Promise<void>;
  logoutAction: () => Promise<void>;
  revokeAllAction: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  user: null,
  error: null,
  isBootstrapped: false,
  bootstrap: async () => {
    set({ status: "refreshing", error: null });

    try {
      await refreshSession();
      set({
        status: "authenticated",
        isBootstrapped: true,
        error: null,
      });
    } catch {
      set({
        status: "unauthenticated",
        user: null,
        isBootstrapped: true,
        error: null,
      });
    }
  },
  loginAction: async (credentials) => {
    set({ status: "refreshing", error: null });

    try {
      const user = await login(credentials);
      set({ status: "authenticated", user, error: null });
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      set({ status: "unauthenticated", error: normalizedError.message });
      throw normalizedError;
    }
  },
  registerAction: async (credentials) => {
    set({ status: "refreshing", error: null });

    try {
      const user = await register(credentials);
      set({ status: "authenticated", user, error: null });
    } catch (error) {
      const normalizedError = normalizeApiError(error);
      set({ status: "unauthenticated", error: normalizedError.message });
      throw normalizedError;
    }
  },
  logoutAction: async () => {
    await logoutSession();
    set({ status: "unauthenticated", user: null, error: null });
  },
  revokeAllAction: async () => {
    await revokeSessions();
    set({ status: "unauthenticated", user: null, error: null });
  },
  clearError: () => set({ error: null }),
}));

setUnauthorizedHandler(() => {
  useAuthStore.setState({
    status: "unauthenticated",
    user: null,
    error: null,
    isBootstrapped: true,
  });
});
