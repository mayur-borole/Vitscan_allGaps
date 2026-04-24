import { Button } from "@/components/ui/button";
import { Activity, LogIn, LogOut, Moon, ScanLine, Sun } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/components/auth/AuthProvider";

export function LandingNav() {
  const { isDark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative rounded-full px-3 py-1.5 text-sm transition-colors after:absolute after:left-3 after:right-3 after:-bottom-0.5 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-full after:bg-emerald-500 after:transition-transform hover:after:scale-x-100 ${
      isActive
        ? "bg-sky-100 text-sky-700 after:scale-x-100"
        : "text-muted-foreground hover:bg-sky-50 hover:text-slate-900"
    }`;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="gradient-primary rounded-lg p-2">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">VitaScan<span className="gradient-text">AI</span></span>
        </Link>
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/reports" className={navLinkClass}>
            Reports
          </NavLink>
          <NavLink to="/upload" className={navLinkClass}>
            Scan
          </NavLink>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await logout();
                navigate("/", { replace: true });
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
          <Button variant="gradient" size="sm" asChild>
            <Link to="/upload">
              <ScanLine className="mr-2 h-4 w-4" /> Start Scan
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
