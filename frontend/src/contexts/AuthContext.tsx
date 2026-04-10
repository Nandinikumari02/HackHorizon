import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import type { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initial load par localStorage se user nikalne ki koshish karein
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);

  const role = user?.role ?? null;

  // Role badalne ka function (AppLayout ke liye)
  const switchRole = useCallback((newRole: UserRole) => {
    if (user && user.role !== newRole) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [user]);

  // Auth Sync: Check current user status
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await fetch("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          const data = await res.json();
          
          if (res.ok) {
            const userToSet = data.user || data;
            setUser(userToSet);
            localStorage.setItem("user", JSON.stringify(userToSet));
          } else {
            logout();
          }
        } catch (error) {
          console.error("Auth Sync Error:", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [token]);

  // Login Function (FIXED)
  const login = async (email: string, password: string) => {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    const userToSet = data.user || data;
    
    // Sab kuch sync mein save karein
    setToken(data.token);
    setUser(userToSet);
    
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(userToSet)); 
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user"); 
  };

  return (
    <AuthContext.Provider value={{ user, token, role, login, logout, switchRole, isLoading }}>
      {!isLoading ? children : (
        <div className="h-screen w-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}