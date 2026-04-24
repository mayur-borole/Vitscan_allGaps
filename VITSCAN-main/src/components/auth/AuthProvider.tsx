import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  clearAuthSession,
  fetchCurrentUser,
  forgotPassword,
  getStoredAuthUser,
  loginWithCredentials,
  logoutUser,
  registerUser,
  type AuthUser,
  type ForgotPasswordPayload,
  type LoginPayload,
  type RegisterPayload,
} from "@/components/services/aiApi";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  resetPassword: (payload: ForgotPasswordPayload) => Promise<string>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(getStoredAuthUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((me) => setUser(me))
      .catch(() => {
        clearAuthSession();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (payload: LoginPayload) => {
        const loggedInUser = await loginWithCredentials(payload);
        setUser(loggedInUser);
      },
      register: async (payload: RegisterPayload) => {
        const loggedInUser = await registerUser(payload);
        setUser(loggedInUser);
      },
      resetPassword: async (payload: ForgotPasswordPayload) => {
        return await forgotPassword(payload);
      },
      logout: async () => {
        await logoutUser();
        setUser(null);
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
