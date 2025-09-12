import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
// import type { User } from "@shared/schema";
import axios from "axios";


interface User {
  email: string;
  name: string;
  role?: "user";
  industries: string[];
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app load → check token and fetch user
  useEffect(() => {
  const fetchUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/api/user/get-user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(res.data);
      

      if(res.status !== 200) {
        throw new Error("Failed to fetch user");
      }

      if (!res.data || !res.data.user) {
        throw new Error("User not found");
      }

      setUser({ email: res.data.user.email, name: res.data.user.name, industries: res.data.user.industries });


    } catch (error) {
      // localStorage.removeItem("token");
      console.log(error);

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, []);
  // Login → store token & fetch user
  const login = async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/login", { email, password });
    if (!res.ok) throw new Error("Login failed");

    const { token, user } = await res.json();
    localStorage.setItem("token", token);
    setUser(user);
  };

  // Logout → remove token & reset user
  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
