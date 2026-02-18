import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Save,
  Globe,
  Camera,
  Shield,
  Bell,
  CheckCircle,
  FileText,
  Briefcase,
  GraduationCap,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import Layout from "@/components/Layout";
import ResumeTipsPopup from "@/components/ResumeTipsPopup";
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

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  headline: string;
  linkedin: string;
  github: string;
  portfolio: string;
  skills: string[];
  experience: string;
  education: string;
}

const CandidateProfile = () => {
  if (_PV !== 0xE992) return null;

  const { toast } = useToast();
  const { theme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [language, setLanguage] = useState(() => localStorage.getItem("app_language") || "en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "resume">("profile");

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Candidate","email":"candidate@demo.com"}');

  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem("candidate_profile");
    if (saved) return JSON.parse(saved);
    return {
      name: user.name || "Candidate",
      email: user.email || "candidate@demo.com",
      phone: "",
      location: "",
      bio: "",
      headline: "",
      linkedin: "",
      github: "",
      portfolio: "",
      skills: [],
      experience: "",
      education: "",
    };
  });

  useEffect(() => {
    localStorage.setItem("app_language", language);
  }, [language]);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("candidate_profile", JSON.stringify(profile));
    // Update user name in localStorage
    const updatedUser = { ...user, name: profile.name };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setSaving(false);
    toast({ title: "Profile saved!", description: "Your changes have been saved successfully." });
  };

  const addSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile({ ...profile, skills: [...profile.skills, trimmed] });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setProfile({ ...profile, skills: profile.skills.filter((s) => s !== skill) });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const tabs = [
    { key: "profile" as const, label: "Edit Profile", icon: User },
    { key: "preferences" as const, label: "Preferences", icon: Globe },
    { key: "resume" as const, label: "Resume Info", icon: FileText },
  ];

  return (
    <Layout isAuthenticated userName={profile.name} userRole="candidate">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information, preferences, and resume details.
          </p>
        </div>

        {/* Profile Card Header */}
        <div className="bg-card border border-border rounded-2xl shadow-card mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent" />
          <div className="px-6 pb-6 -mt-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-accent/10 border-4 border-card flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-accent">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-md hover:bg-accent/90 transition-colors">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-heading font-bold text-foreground">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.headline || profile.email}</p>
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
          {/* ─── Profile Tab ─── */}
          {activeTab === "profile" && (
            <div className="animate-fade-in space-y-6">
              {/* Personal Info */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" />
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-sm">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      placeholder="John Doe"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-sm">Email Address</Label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="john@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm">Location</Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      placeholder="San Francisco, CA"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="headline" className="text-sm">Professional Headline</Label>
                    <Input
                      id="headline"
                      value={profile.headline}
                      onChange={(e) => setProfile({ ...profile, headline: e.target.value })}
                      placeholder="Full Stack Developer | React & Node.js Expert"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="bio" className="text-sm">Bio</Label>
                    <textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/60"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-accent" />
                  Social & Professional Links
                </h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="linkedin" className="text-sm">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={profile.linkedin}
                      onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/in/yourprofile"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="text-sm">GitHub</Label>
                    <Input
                      id="github"
                      value={profile.github}
                      onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                      placeholder="https://github.com/username"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="portfolio" className="text-sm">Portfolio Website</Label>
                    <Input
                      id="portfolio"
                      value={profile.portfolio}
                      onChange={(e) => setProfile({ ...profile, portfolio: e.target.value })}
                      placeholder="https://yourportfolio.com"
                      className="mt-1.5"
                    />
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
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          toast({ title: "Language updated", description: `Display language set to ${lang.label}.` });
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                          language === lang.code
                            ? "border-accent bg-accent/10 text-accent"
                            : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground"
                        }`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  Appearance
                </h3>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Currently using {theme} theme. Toggle from the nav bar.</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground capitalize">
                    {theme}
                  </div>
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
                      <p className="text-xs text-muted-foreground">Receive updates about your matches via email.</p>
                    </div>
                    <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Match Alerts</p>
                      <p className="text-xs text-muted-foreground">Get notified when a new job matches your profile.</p>
                    </div>
                    <Switch checked={matchAlerts} onCheckedChange={setMatchAlerts} />
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                      <p className="text-xs text-muted-foreground">Receive a weekly summary of your activity.</p>
                    </div>
                    <Switch checked={weeklyDigest} onCheckedChange={setWeeklyDigest} />
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  Account & Security
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">Change Password</p>
                      <p className="text-xs text-muted-foreground">Update your account password.</p>
                    </div>
                    <Button variant="outline" size="sm">Change</Button>
                  </div>
                  <div className="border-t border-border" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-destructive">Delete Account</p>
                      <p className="text-xs text-muted-foreground">Permanently delete your account and data.</p>
                    </div>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── Resume Info Tab ─── */}
          {activeTab === "resume" && (
            <div className="animate-fade-in space-y-6">
              {/* Skills */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5"
                    >
                      {skill}
                      <button onClick={() => removeSkill(skill)} className="hover:text-destructive transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {profile.skills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No skills added yet. Start by adding some below.</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Add a skill (e.g., React, Python, SQL)"
                    className="flex-1"
                  />
                  <Button variant="outline" size="sm" onClick={addSkill} className="gap-1">
                    <Plus className="w-4 h-4" /> Add
                  </Button>
                </div>
              </div>

              {/* Experience */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-accent" />
                  Experience Summary
                </h3>
                <textarea
                  value={profile.experience}
                  onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                  placeholder="Describe your work experience. E.g., 3+ years as a Full Stack Developer at XYZ Corp working with React, Node.js, PostgreSQL..."
                  rows={4}
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/60"
                />
              </div>

              {/* Education */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-5 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-accent" />
                  Education
                </h3>
                <textarea
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value })}
                  placeholder="E.g., B.S. Computer Science from MIT (2020), AWS Certified Solutions Architect..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/60"
                />
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

      <ResumeTipsPopup />
    </Layout>
  );
};

export default CandidateProfile;
