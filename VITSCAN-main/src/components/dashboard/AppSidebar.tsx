import {
  LayoutDashboard, ScanLine, FileText, MessageCircle, Apple, Settings, Activity, TrendingUp, Home,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "New Scan", url: "/upload", icon: ScanLine },
  { title: "My Reports", url: "/reports", icon: FileText },
  { title: "Progress Tracker", url: "/progress", icon: TrendingUp },
  { title: "AI Chatbot", url: "/chatbot", icon: MessageCircle },
  { title: "Dietary Log", url: "/dietary", icon: Apple },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <div className="p-4 flex items-center gap-2">
        <div className="gradient-primary rounded-lg p-1.5 shrink-0">
          <Activity className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && <span className="font-bold text-sm">VitaScan<span className="gradient-text">AI</span></span>}
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
