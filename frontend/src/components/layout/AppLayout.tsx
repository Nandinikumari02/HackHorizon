import { useMemo, useEffect, type ReactNode } from 'react';
import { useLocation, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bell, Loader2, Recycle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type { UserRole } from '@/types';

interface AppLayoutProps {
  children?: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, role, isLoading: loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const roleFromPath = useMemo<UserRole>(() => {
    const p = location.pathname.toLowerCase();
    if (p.startsWith('/partner')) return 'RECYCLING_PARTNER';
    if (p.startsWith('/citizen')) return 'CITIZEN';
    if (p.startsWith('/staff')) return 'WASTE_STAFF';
    return 'CITIZEN';
  }, [location.pathname]);

  useEffect(() => {
    if (loading || !user || !role) return;
    const path = location.pathname.toLowerCase();

    if (role === 'CITIZEN' && (path.startsWith('/staff') || path.startsWith('/partner'))) {
      navigate('/citizen', { replace: true });
    }
    if (role === 'WASTE_STAFF' && (path.startsWith('/citizen') || path.startsWith('/partner'))) {
      navigate('/staff', { replace: true });
    }
    if (role === 'RECYCLING_PARTNER' && (path.startsWith('/citizen') || path.startsWith('/staff'))) {
      navigate('/partner', { replace: true });
    }
  }, [role, user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-muted-foreground animate-pulse text-sm font-medium">Loading…</p>
      </div>
    );
  }

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
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground text-sm">
                <Recycle className="h-4 w-4 text-emerald-600" />
                <span className="font-medium text-foreground">EcoSarthi</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {role === 'CITIZEN' && (
                <Button variant="ghost" size="icon" className="relative" asChild>
                  <Link to="/citizen/notifications" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                  </Link>
                </Button>
              )}

              <div className="flex items-center gap-3 pl-3 border-l">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold leading-none mb-1">
                    {user?.fullname || 'User'}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium capitalize">
                    {(role || roleFromPath)?.toString().replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>

                <Avatar className="h-9 w-9 border">
                  <AvatarFallback className="bg-emerald-600 text-white text-xs font-bold">
                    {(user?.fullname || 'U')
                      .split(' ')
                      .filter(Boolean)
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 overflow-auto bg-gradient-to-b from-muted/20 to-background">
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
