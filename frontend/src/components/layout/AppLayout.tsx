import { useMemo, useEffect, type ReactNode } from "react"; // 1. Added ReactNode
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "./AppSidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Loader2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import type { UserRole } from "@/types";

// Interface define karein taaki wrapper use karne par error na aaye
interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role, isLoading: loading } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();

  const roleFromPath = useMemo<UserRole>(() => {
    const p = location.pathname.toLowerCase();
    if (p.startsWith("/superadmin")) return "SUPER_ADMIN"; 
    if (p.startsWith("/citizen")) return "CITIZEN";
    if (p.startsWith("/departments")) return "DEPARTMENT_ADMIN";
    if (p.startsWith("/staff")) return "STAFF";
    return "CITIZEN";
  }, [location.pathname]);

  useEffect(() => {
    if (!loading && user && role) {
      const path = location.pathname.toLowerCase();
      
      // Protection Logic
      if (role !== 'SUPER_ADMIN' && path.startsWith('/superadmin')) {
        navigate('/'); 
      }
      if (role === 'DEPARTMENT_ADMIN' && path.startsWith('/citizen')) {
        navigate('/departments');
      }
      if (role === 'CITIZEN' && (path.startsWith('/superadmin') || path.startsWith('/departments'))) {
        navigate('/citizen');
      }
    }
  }, [role, user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">
          Loading your profile...
        </p>
      </div>
    );
  }

  // Agar user logged in nahi hai toh logic handle karein
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar role={(role as UserRole) || roleFromPath} />

        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-card flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div className="hidden md:flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 w-64 text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full border border-card" />
              </Button>

              <div className="flex items-center gap-3 pl-3 border-l">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold leading-none mb-1">
                    {user?.fullname || "Civic User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium capitalize">
                    {(role || roleFromPath)?.toString().replace("_", " ").toLowerCase()}
                  </p>
                </div>

                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                    {(user?.fullname || "U")
                      .split(" ")
                      .filter(Boolean) // Khali strings hatane ke liye
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 overflow-auto bg-muted/10">
            {/* AGAR CHILDREN HAI TOH WOH DIKHAO (FOR DIRECT WRAPPING), VARNA OUTLET (FOR NESTED ROUTES) */}
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}