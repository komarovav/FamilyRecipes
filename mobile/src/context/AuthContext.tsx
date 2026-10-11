import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMe, User } from "../api/auth";

type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const saved = await AsyncStorage.getItem("token");
        if (!saved) {
          setIsLoading(false);
          return;
        }
        setToken(saved);
        const userData = await getMe(saved);
        setUser(userData);
      } catch {
        await AsyncStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

const login = async (newToken: string) => {
  if (!newToken) {
    throw new Error("Токен не получен");
  }
  await AsyncStorage.setItem("token", newToken);
  setToken(newToken);
  const userData = await getMe(newToken);
  setUser(userData);
};

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}