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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import FeatureCard from "@/components/FeatureCard";
import heroImage from "@/assets/hero-illustration.jpg";

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
  },
  {
    step: "02",
    title: "Enter Job Description",
    description: "Paste or select the job description you want to match against.",
  },
  {
    step: "03",
    title: "Get Match Results",
    description: "View your match score, skill gaps, and actionable improvement suggestions.",
  },
];

const Landing = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Zap className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-accent">
                  AI-Powered Resume Matching
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-primary-foreground leading-tight mb-6">
                Match Your Resume
                <br />
                <span className="text-accent">With Precision</span>
              </h1>

              <p className="text-lg text-primary-foreground/70 max-w-lg mb-8 leading-relaxed">
                Upload your resume, paste a job description, and let our AI analyze the
                compatibility. Get instant match scores, skill gap insights, and
                actionable improvement suggestions.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/auth?mode=register">
                  <Button variant="accent" size="xl" className="gap-2">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/auth?mode=login">
                  <Button
                    variant="hero-outline"
                    size="xl"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="animate-fade-in-up delay-200 hidden lg:block">
              <div className="relative">
                <div className="absolute -inset-4 bg-accent/10 rounded-2xl blur-2xl" />
                <img
                  src={heroImage}
                  alt="AI-powered resume and job description matching visualization"
                  className="relative rounded-2xl shadow-lg border border-accent/10 w-full"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Powerful Features for{" "}
              <span className="text-accent">Smart Hiring</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
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
      <section className="py-20 lg:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to find your perfect match.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className="text-center animate-fade-in-up"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationFillMode: "both",
                }}
              >
                <div className="w-16 h-16 rounded-2xl gradient-accent mx-auto mb-4 flex items-center justify-center">
                  <span className="text-xl font-heading font-bold text-accent-foreground">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl gradient-hero p-10 sm:p-16 text-center">
            <div className="absolute inset-0 opacity-10">
              <div
                className="w-full h-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 30% 50%, hsl(172 66% 50% / 0.4) 0%, transparent 50%)",
                }}
              />
            </div>
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground mb-4">
                Ready to Find Your Perfect Match?
              </h2>
              <p className="text-primary-foreground/70 max-w-lg mx-auto mb-8">
                Join hundreds of candidates and recruiters using AI to streamline the
                hiring process.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/auth?mode=register">
                  <Button variant="accent" size="xl" className="gap-2">
                    Create Free Account
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap justify-center gap-6 mt-8 text-primary-foreground/50 text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" /> Free to use
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" /> No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-accent" /> Instant results
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
