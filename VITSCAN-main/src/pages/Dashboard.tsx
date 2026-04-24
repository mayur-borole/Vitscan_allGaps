import { DashboardContent } from "@/components/dashboard/DashboardContent";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function Dashboard() {
  return (
    <DashboardLayout
      title="Dashboard"
      headerActions={(
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      )}
    >
      <DashboardContent />
    </DashboardLayout>
  );
}
