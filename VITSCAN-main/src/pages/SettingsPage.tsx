import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { motion } from "framer-motion";
import { User, Bell, Shield, Watch, Palette, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SettingsPage() {
  const { isDark, toggle } = useTheme();
  const { user } = useAuth();

  return (
    <DashboardLayout title="Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
              <input value={user?.name ?? ""} readOnly className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input value={user?.email ?? ""} readOnly className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Age</label>
              <input value={user?.age ?? ""} readOnly className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
              <input value={user?.phone ?? ""} readOnly className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
              <input value={user?.gender ?? ""} readOnly className="w-full rounded-xl bg-muted px-4 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
          <Button variant="gradient" size="sm" disabled>Profile Synced</Button>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Palette className="h-5 w-5 text-primary" /> Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Switch between light and dark theme</p>
            </div>
            <Switch checked={isDark} onCheckedChange={toggle} />
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Notifications</h3>
          {[
            { label: "Scan Results", desc: "Get notified when AI analysis is complete" },
            { label: "Weekly Health Summary", desc: "Receive weekly progress digest via email" },
            { label: "Dietary Reminders", desc: "Daily reminders to log your meals" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Privacy & Security</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Two-Factor Authentication</p>
              <p className="text-xs text-muted-foreground">Add extra security to your account</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Share Data with Research</p>
              <p className="text-xs text-muted-foreground">Anonymously contribute to AI model improvement</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button variant="outline" size="sm" className="text-destructive">Delete Account</Button>
        </motion.div>

        {/* Wearable */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Watch className="h-5 w-5 text-primary" /> Wearable Integration</h3>
          <p className="text-sm text-muted-foreground">Connect your wearable device to sync health data automatically.</p>
          <div className="flex gap-3">
            <Button variant="outline" size="sm"><Globe className="mr-1 h-4 w-4" /> Apple Health</Button>
            <Button variant="outline" size="sm"><Globe className="mr-1 h-4 w-4" /> Google Fit</Button>
            <Button variant="outline" size="sm"><Globe className="mr-1 h-4 w-4" /> Fitbit</Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
