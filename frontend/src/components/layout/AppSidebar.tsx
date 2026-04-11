import { useAuth } from '@/contexts/AuthContext';
import {
  BarChart3,
  Bell,
  CheckCircle,
  ClipboardList,
  Home,
  LogOut,
  MapPin,
  Recycle,
  Settings,
  Trophy,
  Truck,
} from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

type NavItem = { title: string; icon: typeof Home; url: string };

export function AppSidebar({ role: propRole }: { role?: UserRole }) {
  const { role: contextRole, logout } = useAuth();
  const role = propRole ?? contextRole;
  const location = useLocation();

  const citizenLinks: NavItem[] = [
    { title: 'Scan waste', icon: Recycle, url: '/citizen' },
    { title: 'History', icon: BarChart3, url: '/citizen/history' },
    { title: 'Rewards', icon: Trophy, url: '/citizen/rewards' },
    { title: 'Notifications', icon: Bell, url: '/citizen/notifications' },
  ];

  const staffLinks: NavItem[] = [
    { title: 'Dashboard', icon: Home, url: '/staff' },
    { title: 'My tasks', icon: ClipboardList, url: '/staff/my-tasks' },
    { title: 'Task map', icon: MapPin, url: '/staff/task-map' },
    { title: 'Completed', icon: CheckCircle, url: '/staff/completed' },
  ];

  const partnerLinks: NavItem[] = [
    { title: 'Pending pickups', icon: Truck, url: '/partner' },
  ];

  const adminLinks: NavItem[] = [
    { title: 'Partner hub', icon: Truck, url: '/partner' },
    { title: 'Staff dashboard', icon: Home, url: '/staff' },
    { title: 'Staff tasks', icon: ClipboardList, url: '/staff/my-tasks' },
    { title: 'Staff map', icon: MapPin, url: '/staff/task-map' },
    { title: 'Completed', icon: CheckCircle, url: '/staff/completed' },
  ];

  const getLinks = (): NavItem[] => {
    switch (role) {
      case 'ADMIN':
        return adminLinks;
      case 'CITIZEN':
        return citizenLinks;
      case 'RECYCLING_PARTNER':
        return partnerLinks;
      case 'WASTE_STAFF':
        return staffLinks;
      default:
        return citizenLinks;
    }
  };

  const links = getLinks();

  const getRoleLabel = () => {
    switch (role) {
      case 'ADMIN':
        return 'Administrator';
      case 'CITIZEN':
        return 'Citizen';
      case 'RECYCLING_PARTNER':
        return 'Recycling partner';
      case 'WASTE_STAFF':
        return 'Field staff';
      default:
        return 'EcoSarthi';
    }
  };

  const isActive = (url: string) => {
    const p = location.pathname;
    if (url === '/citizen') return p === '/citizen';
    if (url === '/partner') return p === '/partner' || p.startsWith('/partner/');
    if (url === '/staff') return p === '/staff';
    return p === url || p.startsWith(url + '/');
  };

  return (
    <Sidebar className="border-r-0 md:border-r">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 rounded-lg">
          <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
            <Recycle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-sidebar-foreground">EcoSarthi</h1>
            <p className="text-xs text-sidebar-foreground/70">{getRoleLabel()}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => (
                <SidebarMenuItem key={link.title}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      'w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
                      isActive(link.url) &&
                        'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    )}
                  >
                    <Link to={link.url}>
                      <link.icon className="h-4 w-4" />
                      <span>{link.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => logout?.()}
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
