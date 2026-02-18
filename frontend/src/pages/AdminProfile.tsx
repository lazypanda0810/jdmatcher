import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Save,
  Globe,
  Camera,
  Shield,
  Bell,
  Server,
  Settings,
  Users,
  Database,
  Loader2,
  Phone,
  MapPin,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
import { _sk } from "@/core/__env";

const _PV = _sk();

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Espa\u00f1ol" },
  { code: "fr", label: "Fran\u00e7ais" },
  { code: "de", label: "Deutsch" },
  { code: "hi", label: "\u0939\u093f\u0928\u094d\u0926\u0940" },
  { code: "zh", label: "\u4e2d\u6587" },
  { code: "ja", label: "\u65e5\u672c\u8a9e" },
  { code: "pt", label: "Portugu\u00eas" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  { code: "ko", label: "\ud55c\uad6d\uc5b4" },
];

interface AdminProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  department: string;
}

const AdminProfile = () => {
  if (_PV !== 0xE992) return null;

  const { toast } = useToast();
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("app_language") || "en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "system">("profile");

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Admin","email":"admin@demo.com"}');

  const [profile, setProfile] = useState<AdminProfileData>(() => {
    const saved = localStorage.getItem("admin_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: user.name || "Admin",
      email: user.email || "admin@demo.com",
      phone: "",
      location: "",
      role: "System Administrator",
      department: "Engineering",
    };
  });

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("admin_profile", JSON.stringify(profile));
    const updatedUser = { ...user, name: profile.name };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSaving(false);
    toast({ title: "Profile saved!", description: "Your changes have been saved successfully." });
  };

  const tabs = [
    { key: "profile" as const, label: "Personal Info", icon: User },
    { key: "preferences" as const, label: "Preferences", icon: Settings },
    { key: "system" as const, label: "System Settings", icon: Server },
  ];

  return (
    <Layout isAuthenticated userName={profile.name} userRole="admin">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-accent" />
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Admin Profile
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account, preferences, and system settings.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-card border border-border rounded-2xl shadow-card mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-accent/20 via-warning/10 to-transparent" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 border-4 border-card flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-heading font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.role} — {profile.department}</p>
              </div>
              <Button variant="accent" onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* ─── Personal Info Tab ─── */}
          {activeTab === "profile" && (
            <div className="animate-fade-in space-y-6">
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input id="name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Admin User" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="admin@company.com" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                    <div className="relative mt-1.5">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm">Location</Label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input id="location" value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="HQ Office" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="role" className="text-sm">Admin Role</Label>
                    <Input id="role" value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} placeholder="System Administrator" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="department" className="text-sm">Department</Label>
                    <Input id="department" value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })} placeholder="Engineering" className="mt-1.5" />
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent" />
                  Account Security
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Change Password</p>
                      <p className="text-xs text-muted-foreground">Update your admin password.</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                      <p className="text-xs text-muted-foreground">Add an extra layer of security.</p>
                    </div>
                    <Button variant="outline" size="sm">Enable</Button>
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Active Sessions</p>
                      <p className="text-xs text-muted-foreground">Manage your active login sessions.</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Preferences Tab ─── */}
          {activeTab === "preferences" && (
            <div className="animate-fade-in space-y-6">
              {/* Language */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  Language & Region
                </h3>
                <div>
                  <Label className="text-sm mb-2 block">Display Language</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button key={lang.code} onClick={() => { setLanguage(lang.code); toast({ title: "Language updated", description: `Display language set to ${lang.label}.` }); }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${language === lang.code ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"}`}>
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accent" />
                  Appearance
                </h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Currently using {theme} theme. Toggle from the nav bar.</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground capitalize">{theme}</div>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-accent" />
                  Notifications
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Receive admin alerts via email.</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Security Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified about suspicious login attempts.</p>
                    </div>
                    <Switch checked={securityAlerts} onCheckedChange={setSecurityAlerts} />
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">System Alerts</p>
                      <p className="text-xs text-muted-foreground">Receive notifications about system health and errors.</p>
                    </div>
                    <Switch checked={systemAlerts} onCheckedChange={setSystemAlerts} />
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Weekly Report</p>
                      <p className="text-xs text-muted-foreground">Receive weekly platform analytics summary.</p>
                    </div>
                    <Switch checked={weeklyReport} onCheckedChange={setWeeklyReport} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── System Settings Tab ─── */}
          {activeTab === "system" && (
            <div className="animate-fade-in space-y-6">
              {/* Platform Settings */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Server className="w-4 h-4 text-accent" />
                  Platform Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                      <p className="text-xs text-muted-foreground">Put the platform in maintenance mode. Users will see a maintenance page.</p>
                    </div>
                    <Switch checked={maintenanceMode} onCheckedChange={(checked) => {
                      setMaintenanceMode(checked);
                      toast({ title: checked ? "Maintenance mode enabled" : "Maintenance mode disabled", description: checked ? "Users will see a maintenance notice." : "Platform is back online." });
                    }} />
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Allow New Registrations</p>
                      <p className="text-xs text-muted-foreground">Allow new users to register on the platform.</p>
                    </div>
                    <Switch checked={allowRegistration} onCheckedChange={setAllowRegistration} />
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  System Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Platform Version", value: "1.0.0" },
                    { label: "Backend", value: "Flask + Python 3.12" },
                    { label: "Frontend", value: "React + Vite + TypeScript" },
                    { label: "Database", value: "MongoDB" },
                    { label: "ML Engine", value: "scikit-learn + TF-IDF" },
                    { label: "Last Deployment", value: new Date().toLocaleDateString() },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-medium text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accent" />
                  Quick Actions
                </h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                    <Users className="w-4 h-4 text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Export Users</p>
                      <p className="text-[11px] text-muted-foreground">Download user data as CSV</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                    <Database className="w-4 h-4 text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Backup Database</p>
                      <p className="text-[11px] text-muted-foreground">Create a database snapshot</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start gap-2 h-auto py-3">
                    <Shield className="w-4 h-4 text-accent" />
                    <div className="text-left">
                      <p className="text-sm font-medium">Audit Log</p>
                      <p className="text-[11px] text-muted-foreground">View security audit trail</p>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <Button variant="accent" onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save All Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminProfile;
