import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Home, LogOut, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

interface DashboardLayoutProps {
  title: string;
  children: ReactNode;
  headerActions?: ReactNode;
}

export function DashboardLayout({ title, children, headerActions }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between border-b border-border/50 px-4 glass-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <h1 className="text-lg font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}> 
                <Home className="mr-2 h-4 w-4" /> Home
              </Button>
              {user && (
                <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/60 bg-muted/30 px-3 py-1 text-xs">
                  <User className="h-3.5 w-3.5" />
                  <span className="font-medium">{user.name}</span>
                </div>
              )}
              <ThemeToggle />
              {headerActions}
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await logout();
                  navigate("/login", { replace: true });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
