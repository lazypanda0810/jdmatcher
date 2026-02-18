import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, LayoutDashboard, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

interface LayoutProps {
  children: React.ReactNode;
  /** If true, shows the full nav with dashboard links */
  isAuthenticated?: boolean;
  userRole?: "candidate" | "recruiter" | "admin";
  userName?: string;
}

const Layout = ({
  children,
  isAuthenticated = false,
  userRole,
  userName,
}: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case "recruiter":
        return "/recruiter";
      case "admin":
        return "/admin";
      default:
        return "/candidate";
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo />

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardLink()}>
                    <Button
                      variant={isActive(getDashboardLink()) ? "secondary" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Button>
                  </Link>
                  {userRole === "candidate" && (
                    <Link to="/candidate/profile">
                      <Button
                        variant={isActive("/candidate/profile") ? "secondary" : "ghost"}
                        size="sm"
                        className="gap-2"
                      >
                        <UserCog className="w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {userName || "User"}
                      </span>
                    </div>
                    <ThemeToggle />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      className="text-muted-foreground"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link to="/auth?mode=login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/auth?mode=register">
                    <Button variant="accent" size="sm">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-fade-in">
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {userRole === "candidate" && (
                    <Link
                      to="/candidate/profile"
                      className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                  )}
                  <div className="px-3 py-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-secondary"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link
                    to="/auth?mode=login"
                    className="block px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-secondary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth?mode=register"
                    className="block px-3 py-2 rounded-md text-sm font-medium bg-accent text-accent-foreground text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2026 ResumeAI. AI-Powered Resume & Job Description Matcher.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
