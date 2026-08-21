import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { UserAuth } from "../types/UserAuth";
import { api } from "../services/api";

type LoginPayload = {
  token: string;
  user?: UserAuth | null;
};

type ApiResponse<T> = {
  statusCode: number;
  message: string;
  data: T;
};

type AuthContextType = {
  token: string | null;
  user: UserAuth | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => void;
  logout: () => Promise<void>;
  setUser: (user: UserAuth | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUserState] = useState<UserAuth | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = async () => {
    try {
      if (localStorage.getItem(TOKEN_KEY)) {
        await api.post("/api/auth/logout", undefined, { auth: true });
      }
    } catch (error) {
      // Best-effort: local session state is cleared below regardless of network/API failure.
      console.error("Failed to notify server of logout:", error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUserState(null);
    }
  };

  const setUser = (user: UserAuth | null) => {
    if (user && Number(user.IsActive) === 0) {
      logout();
      return;
    }

    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      setUserState(user);
    } else {
      localStorage.removeItem(USER_KEY);
      setUserState(null);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get<ApiResponse<UserAuth>>("/api/auth/me", {
        auth: true,
      });

      const latestUser = response?.data ?? null;
      // console.log("Fetched current user:", latestUser);

      if (!latestUser || Number(latestUser.IsActive) === 0) {
        logout();
        return;
      }

      localStorage.setItem(USER_KEY, JSON.stringify(latestUser));
      setUserState(latestUser);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      logout();
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as UserAuth;

        if (Number(parsedUser?.IsActive) === 0) {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUserState(null);
        } else {
          setUserState(parsedUser);
        }
      } catch {
        localStorage.removeItem(USER_KEY);
        setUserState(null);
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!token) return;

    fetchCurrentUser();

    const interval = setInterval(() => {
      fetchCurrentUser();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (user && Number(user.IsActive) === 0) {
      logout();
    }
  }, [user]);

  const login = ({ token, user }: LoginPayload) => {
    if (user && Number(user.IsActive) === 0) {
      logout();
      return;
    }

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

// import {
//   createContext,
//   useContext,
//   useEffect,
//   useMemo,
//   useState,
//   type ReactNode,
// } from "react";
// import { UserAuth } from "../types/UserAuth";

// type LoginPayload = {
//   token: string;
//   user?: UserAuth | null;
// };

// type AuthContextType = {
//   token: string | null;
//   user: UserAuth | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   login: (payload: LoginPayload) => void;
//   logout: () => void;
//   setUser: (user: UserAuth | null) => void;
// };

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// const TOKEN_KEY = "token";
// const USER_KEY = "user";

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [token, setToken] = useState<string | null>(null);
//   const [user, setUserState] = useState<UserAuth | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   const logout = () => {
//     localStorage.removeItem(TOKEN_KEY);
//     localStorage.removeItem(USER_KEY);
//     setToken(null);
//     setUserState(null);
//   };

//   useEffect(() => {
//     const savedToken = localStorage.getItem(TOKEN_KEY);
//     const savedUser = localStorage.getItem(USER_KEY);

//     if (savedToken) {
//       setToken(savedToken);
//     }

//     if (savedUser) {
//       try {
//         const parsedUser = JSON.parse(savedUser) as UserAuth;

//         if (Number(parsedUser?.IsActive) === 0) {
//           localStorage.removeItem(TOKEN_KEY);
//           localStorage.removeItem(USER_KEY);
//           setToken(null);
//           setUserState(null);
//         } else {
//           setUserState(parsedUser);
//         }
//       } catch {
//         localStorage.removeItem(USER_KEY);
//         setUserState(null);
//       }
//     }

//     setIsLoading(false);
//   }, []);

//   useEffect(() => {
//     if (user && Number(user.IsActive) === 0) {
//       logout();
//     }
//   }, [user]);

//   const login = ({ token, user }: LoginPayload) => {
//     if (user && Number(user.IsActive) === 0) {
//       logout();
//       return;
//     }

//     localStorage.setItem(TOKEN_KEY, token);
//     setToken(token);

//     if (user) {
//       localStorage.setItem(USER_KEY, JSON.stringify(user));
//       setUserState(user);
//     } else {
//       localStorage.removeItem(USER_KEY);
//       setUserState(null);
//     }
//   };

//   const setUser = (user: UserAuth | null) => {
//     if (user && Number(user.IsActive) === 0) {
//       logout();
//       return;
//     }

//     if (user) {
//       localStorage.setItem(USER_KEY, JSON.stringify(user));
//       setUserState(user);
//     } else {
//       localStorage.removeItem(USER_KEY);
//       setUserState(null);
//     }
//   };

//   const value = useMemo(
//     () => ({
//       token,
//       user,
//       isAuthenticated: !!token,
//       isLoading,
//       login,
//       logout,
//       setUser,
//     }),
//     [token, user, isLoading]
//   );

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }

// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }

//   return context;
// }