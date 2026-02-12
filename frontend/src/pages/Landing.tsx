import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Target,
  BarChart3,
  Shield,
  Upload,
  Zap,
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  TrendingUp,
  Sparkles,
  Cpu,
  Globe,
  Lock,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import FeatureCard from "@/components/FeatureCard";
import ParticleField from "@/components/ParticleField";
import HeroSlider from "@/components/HeroSlider";
import AnimatedCounter from "@/components/AnimatedCounter";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import TechMarquee from "@/components/TechMarquee";
import LiveMatchDemo from "@/components/LiveMatchDemo";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Matching",
    description:
      "Our NLP engine analyzes resumes and job descriptions to compute accurate compatibility scores in seconds.",
  },
  {
    icon: Target,
    title: "Skill Gap Analysis",
    description:
      "Identify exactly which skills are missing and get personalized recommendations to improve your profile.",
  },
  {
    icon: BarChart3,
    title: "Visual Analytics",
    description:
      "Interactive charts and dashboards make it easy to understand match results at a glance.",
  },
  {
    icon: Shield,
    title: "ATS-Compatible",
    description:
      "Designed to align with applicant tracking systems used by top employers worldwide.",
  },
  {
    icon: Upload,
    title: "Easy Upload",
    description:
      "Drag and drop your resume in PDF or DOCX format. We handle the parsing automatically.",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description:
      "Get your match score, skill overlap chart, and improvement suggestions within seconds.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload Your Resume",
    description: "Upload your resume in PDF or DOCX format for AI analysis.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Enter Job Description",
    description: "Paste or select the job description you want to match against.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Get Match Results",
    description: "View your match score, skill gaps, and actionable improvement suggestions.",
    icon: TrendingUp,
  },
];

const stats = [
  { label: "Resumes Analyzed", value: 12500, suffix: "+", icon: FileText },
  { label: "Companies Trust Us", value: 350, suffix: "+", icon: Globe },
  { label: "Match Accuracy", value: 96, suffix: "%", icon: Target },
  { label: "Active Users", value: 4800, suffix: "+", icon: Users },
];

const Landing = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero min-h-[100vh] flex items-center">
        <ParticleField />

        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[120px] animate-orb-1" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-info/8 rounded-full blur-[100px] animate-orb-2" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px] animate-orb-3" />

        {/* Horizontal scan lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(45,212,191,0.1) 2px, rgba(45,212,191,0.1) 4px)",
        }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 mb-8 animate-shimmer-border">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span className="text-[11px] font-mono text-accent tracking-wider uppercase">
                  Neural Matching Engine v3.7
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-extrabold text-primary-foreground leading-[1.05] mb-6">
                <span className="block opacity-90">The Future of</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent via-info to-accent bg-[length:200%_auto] animate-gradient-shift">
                  Resume Matching
                </span>
                <span className="block opacity-90">is Here</span>
              </h1>

              <p className="text-lg text-primary-foreground/50 max-w-lg mb-10 leading-relaxed">
                Powered by advanced NLP and deep learning. Upload your resume, let the AI engine
                analyze semantic patterns, and get precision match scores with actionable insights.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link to="/auth?mode=register">
                  <Button variant="accent" size="xl" className="gap-2 group shadow-accent-glow relative overflow-hidden">
                    <span className="relative z-10 flex items-center gap-2">
                      Launch Dashboard
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-accent to-info opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </Button>
                </Link>
                <Link to="/auth?mode=login">
                  <Button variant="hero-outline" size="xl" className="gap-2 group">
                    <Lock className="w-4 h-4" />
                    Access Portal
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-8">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-primary bg-gradient-to-br from-accent/30 to-info/20 flex items-center justify-center"
                    >
                      <Users className="w-3 h-3 text-accent" />
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-sm text-primary-foreground/70 font-semibold">4,800+ Users</p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-warning fill-warning" />
                    ))}
                    <span className="text-xs text-primary-foreground/40 ml-1">4.9/5</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Animated Slider */}
            <div className="hidden lg:block animate-fade-in-up delay-300">
              <HeroSlider />
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="relative -mt-20 z-20 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="group relative p-6 rounded-2xl bg-card/90 border border-border hover:border-accent/20 shadow-card hover:shadow-accent-glow transition-all duration-500 hover:-translate-y-2 text-center backdrop-blur-xl overflow-hidden"
                >
                  {/* Neon top line */}
                  <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent group-hover:via-accent/60 transition-all duration-500" />
                  <div className="relative">
                    <StatIcon className="w-5 h-5 text-accent/50 mx-auto mb-2" />
                    <div className="text-3xl font-heading font-bold text-foreground mb-1">
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.15em]">
                      {stat.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Marquee */}
      <section className="py-8 bg-card/30 border-y border-border/50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <div className="flex items-center justify-center gap-3">
            <Cpu className="w-4 h-4 text-accent/50" />
            <span className="text-xs font-mono text-muted-foreground/50 uppercase tracking-[0.2em]">
              Powered By Leading AI Technologies
            </span>
          </div>
        </div>
        <TechMarquee />
      </section>

      {/* Live Demo + Features Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-info/3 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">Live Preview</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4">
              Watch AI{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-info">
                In Action
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              See how our neural matching engine processes resumes in real-time.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <LiveMatchDemo />
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              {[
                { icon: Cpu, title: "Neural Processing", desc: "Deep learning models analyze semantic meaning, not just keywords" },
                { icon: Target, title: "Precision Scoring", desc: "Multi-dimensional scoring across skills, experience, and fit" },
                { icon: Zap, title: "Real-Time Analysis", desc: "Results in under 0.3 seconds with GPU-accelerated inference" },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="group flex items-start gap-4 p-5 rounded-2xl bg-card/50 border border-border hover:border-accent/20 transition-all duration-500 hover:-translate-y-1 backdrop-blur-sm animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "both" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-base font-heading font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50 relative">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, hsl(var(--accent)) 1px, transparent 0)",
          backgroundSize: "40px 40px"
        }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">Features</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4">
              Powerful Features for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-info">
                Smart Hiring
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Everything candidates and recruiters need to streamline the matching
              process with AI-driven analytics.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4">
              How It{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-info">
                Works
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Three simple steps to find your perfect match.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-[20%] right-[20%] h-[2px] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-accent/0 via-accent/40 to-accent/0" />
              <div className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-accent to-transparent animate-scanner-horizontal" />
            </div>

            {steps.map((item, i) => {
              const StepIcon = item.icon;
              return (
                <div
                  key={item.step}
                  className="group text-center animate-fade-in-up relative"
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div className="relative inline-block mb-6">
                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-2xl bg-accent/20 blur-xl animate-pulse-ring" />
                    <div className="relative w-20 h-20 rounded-2xl gradient-accent mx-auto flex items-center justify-center shadow-accent-glow group-hover:scale-110 transition-transform duration-500">
                      <StepIcon className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background font-mono">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-heading font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 bg-card/30 border-y border-border/50 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <Star className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">Testimonials</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-heading font-bold text-foreground mb-4">
              Trusted by{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-info">
                Professionals
              </span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              See what our users say about the AI matching experience.
            </p>
          </div>
        </div>
        <TestimonialsCarousel />
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 sm:p-16 text-center">
            {/* Animated background */}
            <div className="absolute inset-0">
              <div className="absolute top-0 left-1/3 w-96 h-96 bg-accent/15 rounded-full blur-[100px] animate-orb-1" />
              <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-info/10 rounded-full blur-[80px] animate-orb-2" />
            </div>

            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage:
                "linear-gradient(rgba(45,212,191,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }} />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="text-xs font-mono text-accent uppercase tracking-wider">
                  Start Your Journey
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground mb-6">
                Ready to Find Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-info to-accent bg-[length:200%_auto] animate-gradient-shift">
                  Perfect Match?
                </span>
              </h2>
              <p className="text-primary-foreground/50 max-w-lg mx-auto mb-10 text-lg">
                Join thousands of professionals using AI to transform their hiring process.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth?mode=register">
                  <Button variant="accent" size="xl" className="gap-2 group shadow-accent-glow">
                    Create Free Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/auth?mode=login">
                  <Button variant="hero-outline" size="xl">
                    Login to Dashboard
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-8 mt-10 text-primary-foreground/40 text-sm">
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" /> Free to use
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" /> No credit card
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" /> Instant results
                </span>
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-accent" /> Enterprise-grade security
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
