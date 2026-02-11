import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import Logo from "@/components/Logo";
import { authService } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "register";
type UserRole = "candidate" | "recruiter";

const DEMO_CREDENTIALS = [
  { label: "👤 Login as Candidate", email: "candidate@demo.com", password: "Candidate@123", role: "candidate" },
  { label: "🏢 Login as Recruiter", email: "recruiter@demo.com", password: "Recruiter@123", role: "recruiter" },
  { label: "🛡️ Login as Admin", email: "admin@demo.com", password: "Admin@123", role: "admin" },
] as const;

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>(
    (searchParams.get("mode") as AuthMode) || "login"
  );
  const [role, setRole] = useState<UserRole>("candidate");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    try {
      const result = await authService.login(demoEmail, demoPassword);
      const userData = { ...result.user, role: result.user.role?.toLowerCase() };
      localStorage.setItem("auth_token", result.token);
      localStorage.setItem("user", JSON.stringify(userData));
      toast({ title: "Welcome!", description: `Logged in as ${userData.name}.` });
      const redirectMap: Record<string, string> = { candidate: "/candidate", recruiter: "/recruiter", admin: "/admin" };
      navigate(redirectMap[userData.role] || "/candidate");
    } catch {
      toast({ title: "Error", description: "Demo login failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (mode === "register" && !name)) {
      toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        const result = await authService.login(email, password);
        const userData = { ...result.user, role: result.user.role?.toLowerCase() };
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user", JSON.stringify(userData));
        toast({ title: "Welcome back!", description: "Login successful." });
        const redirectMap: Record<string, string> = { candidate: "/candidate", recruiter: "/recruiter", admin: "/admin" };
        navigate(redirectMap[userData.role] || "/candidate");
      } else {
        const result = await authService.register(email, password, role);
        localStorage.setItem("auth_token", result.token);
        localStorage.setItem("user", JSON.stringify({ ...result.user, name, role }));
        toast({ title: "Account created!", description: "Welcome to ResumeAI." });
        navigate(role === "recruiter" ? "/recruiter" : "/candidate");
      }
    } catch {
      toast({ title: "Error", description: "Invalid credentials. Please use a demo account.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bg-card border border-border rounded-2xl shadow-card p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Logo size="lg" showText={false} />
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {mode === "login" ? "Sign in to access your dashboard" : "Get started with ResumeAI"}
              </p>
            </div>

            {/* Demo Login Buttons */}
            {mode === "login" && (
              <div className="mb-6">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 text-center">
                  Quick Demo Access
                </p>
                <div className="grid gap-2">
                  {DEMO_CREDENTIALS.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleDemoLogin(demo.email, demo.password)}
                      disabled={loading}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-sm font-medium text-foreground transition-all hover:border-accent/40 disabled:opacity-50"
                    >
                      <span>{demo.label}</span>
                      <span className="text-xs text-muted-foreground">{demo.email}</span>
                    </button>
                  ))}
                </div>
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 text-muted-foreground">or sign in manually</span>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                  <div className="relative mt-1.5">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input id="name" type="text" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" maxLength={100} required />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" maxLength={255} required />
                </div>
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" minLength={6} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div>
                  <Label className="text-sm font-medium">I am a</Label>
                  <div className="grid grid-cols-2 gap-3 mt-1.5">
                    <button type="button" onClick={() => setRole("candidate")} className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${role === "candidate" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-accent/30"}`}>
                      👤 Candidate
                    </button>
                    <button type="button" onClick={() => setRole("recruiter")} className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${role === "recruiter" ? "border-accent bg-accent/5 text-accent" : "border-border text-muted-foreground hover:border-accent/30"}`}>
                      🏢 Recruiter
                    </button>
                  </div>
                </div>
              )}

              <Button type="submit" variant="accent" size="lg" className="w-full gap-2 mt-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{mode === "login" ? "Sign In" : "Create Account"}<ArrowRight className="w-4 h-4" /></>}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="font-medium text-accent hover:underline">
                  {mode === "login" ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
