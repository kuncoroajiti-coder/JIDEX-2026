"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  type AuthUser,
  type RegisterInput,
} from "@/lib/api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<AuthUser>;
  register: (
    input: RegisterInput,
  ) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

const AUTH_INIT_TIMEOUT_MS = 5000;

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    const timeoutId = window.setTimeout(() => {
      if (!active) {
        return;
      }

      setUser(null);
      setLoading(false);
    }, AUTH_INIT_TIMEOUT_MS);

    async function initialize() {
      try {
        const currentUser = await getCurrentUser();

        if (!active) {
          return;
        }

        setUser(currentUser);
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          window.clearTimeout(timeoutId);
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, []);

  const login = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<AuthUser> => {
      const authenticatedUser = await apiLogin(
        email,
        password,
      );

      setUser(authenticatedUser);
      setLoading(false);

      return authenticatedUser;
    },
    [],
  );

  const register = useCallback(
    async (
      input: RegisterInput,
    ): Promise<AuthUser> => {
      const authenticatedUser = await apiRegister(input);

      setUser(authenticatedUser);
      setLoading(false);

      return authenticatedUser;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      refresh,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}
