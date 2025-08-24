import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User as FirebaseUser, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          // Get or create user in our database
          const response = await apiRequest("POST", "/api/auth/sync", {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
          });
          const userData = await response.json();
          setUser(userData);
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      } else {
        // Check for test user in localStorage
        const testUser = localStorage.getItem("test-user");
        if (testUser) {
          try {
            setUser(JSON.parse(testUser));
          } catch (error) {
            console.error("Error parsing test user:", error);
            localStorage.removeItem("test-user");
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
      
      setLoading(false);
    });

    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect error:", error);
      setLoading(false);
    });

    // Check for test user on initial load
    const testUser = localStorage.getItem("test-user");
    if (testUser && !auth.currentUser) {
      try {
        setUser(JSON.parse(testUser));
        setLoading(false);
      } catch (error) {
        console.error("Error parsing test user:", error);
        localStorage.removeItem("test-user");
        setLoading(false);
      }
    }

    return unsubscribe;
  }, []);

  const signOut = async () => {
    // Clear test user from localStorage
    localStorage.removeItem("test-user");
    // Sign out from Firebase
    await auth.signOut();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
