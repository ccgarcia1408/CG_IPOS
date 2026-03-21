import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { UserAuth } from "../types/UserAuth";

type LoginPayload = {
  token: string;
  user?: UserAuth | null;
};

type AuthContextType = {
  token: string | null;
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => void;
  logout: () => void;
  setUser: (user: UserAuth | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<UserAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUserState(JSON.parse(savedUser) as UserAuth);
      } catch {
        localStorage.removeItem(USER_KEY);
        setUserState(null);
      }
    }

    setIsLoading(false);
  }, []);

  const login = ({ token, user }: LoginPayload) => {
    localStorage.setItem(TOKEN_KEY, token);
    setToken(token);

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUserState(user);
    } else {
      localStorage.removeItem(USER_KEY);
      setUserState(null);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUserState(null);
  };

  const setUser = (user: UserAuth | null) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUserState(user);
    } else {
      localStorage.removeItem(USER_KEY);
      setUserState(null);
    }
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
      setUser,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}