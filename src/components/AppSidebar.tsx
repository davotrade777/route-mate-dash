import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, FileCheck, Bell, LogOut, Truck, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { title: 'Inicio', url: '/', icon: Home },
  { title: 'Gestión de Pedidos', url: '/orders', icon: Package },
  { title: 'Fletes Asignados', url: '/assigned-freights', icon: FileCheck },
  { title: 'Notificaciones', url: '/notifications', icon: Bell, badge: 3 },
];

const bottomItems = [
  { title: 'Perfil', url: '#', icon: User },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <aside className="flex flex-col h-screen w-14 border-r bg-sidebar sticky top-0 shrink-0 z-30">
        {/* Logo */}
        <div className="flex items-center justify-center h-14 border-b border-sidebar-border">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center"
          >
            <span className="text-2xl font-black text-primary leading-none">a</span>
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col flex-1 items-center py-3 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate(item.url)}
                    className={cn(
                      'relative flex items-center justify-center w-10 h-10 rounded-md transition-colors',
                      isActive
                        ? 'text-primary bg-primary/8'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    {/* Active left indicator */}
                    {isActive && (
                      <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-r-full" />
                    )}
                    <item.icon className="h-[18px] w-[18px]" strokeWidth={isActive ? 2 : 1.5} />
                    {item.badge && (
                      <span className="absolute top-1 right-1 h-4 min-w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[9px] font-bold px-1">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs">
                  {item.title}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="flex flex-col items-center py-3 gap-1 border-t border-sidebar-border">
          {bottomItems.map((item) => (
            <Tooltip key={item.title}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(item.url)}
                  className="flex items-center justify-center w-10 h-10 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                >
                  <item.icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="text-xs">{item.title}</TooltipContent>
            </Tooltip>
          ))}

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="flex items-center justify-center w-10 h-10 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">Cerrar sesión</TooltipContent>
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
