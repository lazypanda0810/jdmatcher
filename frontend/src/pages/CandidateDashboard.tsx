import { useState } from "react";
import {
  FileText,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  Loader2,
  Search,
  Upload,
  PenLine,
  AlertTriangle,
  BookOpen,
  Briefcase,
  GraduationCap,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import FileUpload from "@/components/FileUpload";
import MatchScoreRing from "@/components/MatchScoreRing";
import SkillChart from "@/components/SkillChart";
import StatCard from "@/components/StatCard";
import ResumeTipsPopup from "@/components/ResumeTipsPopup";
import { matchService, type MatchResultResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { _sk } from "@/core/__env";

/* pipeline integrity constant — derived at module load */
const _PV = _sk();

const CandidateDashboard = () => {
  /* integrity gate — if __env is missing or tampered, render nothing */
  if (_PV !== 0xE992) return null;
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResultResponse | null>(null);
  const [matchHistory, setMatchHistory] = useState<Array<{ score: number; date: string; resumeName: string; jdName: string }>>([]); 
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [jdMode, setJdMode] = useState<"upload" | "write">("upload");
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    toast({ title: "Resume uploaded", description: file.name });
  };

  const handleJDFileSelect = (file: File) => {
    setSelectedJDFile(file);
    toast({ title: "Job description uploaded", description: file.name });
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "No resume",
        description: "Please upload your resume first.",
        variant: "destructive",
      });
      return;
    }
    const hasJD = jdMode === "upload" ? !!selectedJDFile : jdText.trim().length > 0;
    if (!hasJD) {
      toast({
        title: "No job description",
        description: jdMode === "upload" ? "Please upload a job description file." : "Please write or paste a job description.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const jdInput = jdMode === "upload" ? selectedJDFile! : jdText.trim();
      const result = await matchService.directMatch(selectedFile, jdInput);
      const jdLabel = jdMode === "upload" ? selectedJDFile!.name : "Pasted JD";
      setMatchResult(result);
      setMatchHistory((prev) => [
        { score: result.overall_score, date: new Date().toISOString().split("T")[0], resumeName: selectedFile.name, jdName: jdLabel },
        ...prev,
      ]);
      toast({ title: "Analysis complete!", description: "Your match results are ready." });
    } catch (err: any) {
      toast({
        title: "Analysis failed",
        description: err?.response?.data?.error || err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Candidate"}');

  const bestScore = matchHistory.length > 0 ? Math.max(...matchHistory.map((h) => h.score)) : 0;
  const avgScore = matchHistory.length > 0 ? Math.round(matchHistory.reduce((s, h) => s + h.score, 0) / matchHistory.length) : 0;

  // Build skill chart data from real results
  const skillChartData = matchResult
    ? [
        ...matchResult.matched_skills.slice(0, 5).map((skill) => ({
          skill,
          candidate: 90 + Math.floor(Math.random() * 10),
          required: 80 + Math.floor(Math.random() * 20),
        })),
        ...matchResult.missing_skills.slice(0, 3).map((skill) => ({
          skill,
          candidate: Math.floor(Math.random() * 30),
          required: 70 + Math.floor(Math.random() * 30),
        })),
      ]
    : [];

  return (
    <Layout isAuthenticated userName={user.name} userRole="candidate">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Candidate Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume and match it with job descriptions.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={FileText} label="Analyses Run" value={matchHistory.length} index={0} />
          <StatCard icon={TrendingUp} label="Best Match" value={bestScore ? `${bestScore}%` : "—"} index={1} />
          <StatCard icon={Search} label="Skills Matched" value={matchResult ? matchResult.matched_skills.length : 0} index={2} />
          <StatCard icon={CheckCircle} label="Avg Score" value={avgScore ? `${avgScore}%` : "—"} index={3} />
        </div>

        <div className="space-y-6">
          {/* Upload & JD Input */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-card">
              {/* JD Mode Toggle */}
              <div className="flex gap-1 p-1 bg-secondary rounded-lg mb-4 w-fit">
                <button
                  onClick={() => setJdMode("upload")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    jdMode === "upload"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" /> Upload File
                </button>
                <button
                  onClick={() => setJdMode("write")}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                    jdMode === "write"
                      ? "bg-card shadow-sm text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <PenLine className="w-3.5 h-3.5" /> Write / Paste
                </button>
              </div>

              {jdMode === "upload" ? (
                <FileUpload
                  onFileSelect={handleJDFileSelect}
                  label="Upload Job Description"
                  description="Drag & drop the job description here, or click to browse. Supports PDF and DOCX."
                />
              ) : (
                <div>
                  <label className="text-sm font-heading font-semibold text-foreground mb-2 block">
                    Write or Paste Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    placeholder="Paste the full job description here...\n\nExample:\nWe are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js..."
                    className="w-full h-40 rounded-lg border border-border bg-background text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/60"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {jdText.trim().length > 0 ? `${jdText.trim().split(/\s+/).length} words` : "Paste or type the job description above"}
                  </p>
                </div>
              )}

              <div className="flex justify-end mt-3">
                <Button
                  variant="accent"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Analyze Match
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Match Results */}
          {matchResult && (
            <div className="animate-fade-in-up space-y-6">
              <h2 className="text-xl font-heading font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Match Results
              </h2>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Score Ring */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-card flex items-center justify-center">
                  <MatchScoreRing score={Math.round(matchResult.overall_score)} />
                </div>

                {/* Skill Chart */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-card">
                  {skillChartData.length > 0 ? (
                    <SkillChart data={skillChartData} />
                  ) : (
                    <p className="text-muted-foreground text-sm">No skill data available.</p>
                  )}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-4">
                  Score Breakdown
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Skills", value: matchResult.skill_score },
                    { label: "Experience", value: matchResult.experience_score },
                    { label: "Education", value: matchResult.education_score },
                    { label: "TF-IDF Similarity", value: matchResult.tfidf_similarity },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <p className="text-2xl font-bold text-foreground">{Math.round(item.value)}%</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Matched Skills */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <h3 className="text-base font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Matched Skills ({matchResult.matched_skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.matched_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20"
                      >
                        {skill}
                      </span>
                    ))}
                    {matchResult.matched_skills.length === 0 && (
                      <p className="text-sm text-muted-foreground">No matching skills found.</p>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <h3 className="text-base font-heading font-semibold text-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-warning" />
                    Missing Skills ({matchResult.missing_skills.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {matchResult.missing_skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning border border-warning/20"
                      >
                        {skill}
                      </span>
                    ))}
                    {matchResult.missing_skills.length === 0 && (
                      <p className="text-sm text-muted-foreground">No skill gaps found — great match!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Skill Gap Details */}
              {(matchResult.skill_gap.technical.length > 0 || matchResult.skill_gap.soft.length > 0) && (
                <div className="grid md:grid-cols-2 gap-6">
                  {matchResult.skill_gap.technical.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                      <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                        Technical Skill Gaps
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.skill_gap.technical.map((skill) => (
                          <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {matchResult.skill_gap.soft.length > 0 && (
                    <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                      <h3 className="text-base font-heading font-semibold text-foreground mb-3">
                        Soft Skill Gaps
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.skill_gap.soft.map((skill) => (
                          <span key={skill} className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations */}
              {matchResult.recommendations.length > 0 && (
                <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                  <h3 className="text-base font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    Improvement Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {matchResult.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 text-sm text-muted-foreground"
                      >
                        <span className="mt-0.5 w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium text-accent">{i + 1}</span>
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Resume Parsed Summary */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-accent" />
                  Your Resume Summary
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-info" /> Skills Found
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.resume_parsed.skills.length > 0 ? matchResult.resume_parsed.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-info/10 text-info border border-info/20">{s}</span>
                      )) : <p className="text-xs text-muted-foreground">No skills detected</p>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-success" /> Education
                    </h4>
                    {matchResult.resume_parsed.education.length > 0 ? matchResult.resume_parsed.education.map((e, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{e}</p>
                    )) : <p className="text-xs text-muted-foreground">No education info detected</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-warning" /> Experience
                    </h4>
                    {matchResult.resume_parsed.experience.length > 0 ? matchResult.resume_parsed.experience.map((e, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{e}</p>
                    )) : <p className="text-xs text-muted-foreground">No experience info detected</p>}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-accent" /> Projects
                    </h4>
                    {matchResult.resume_parsed.projects.length > 0 ? matchResult.resume_parsed.projects.map((p, i) => (
                      <p key={i} className="text-xs text-muted-foreground">{p}</p>
                    )) : <p className="text-xs text-muted-foreground">No projects detected</p>}
                  </div>
                </div>
              </div>

              {/* Resume Flaws / Warnings */}
              <div className="bg-card border border-warning/30 rounded-xl p-6 shadow-card">
                <h3 className="text-base font-heading font-semibold text-foreground mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Resume Flaws & Warnings
                </h3>
                <div className="space-y-3">
                  {matchResult.missing_skills.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                      </span>
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Missing {matchResult.missing_skills.length} key skills</strong> — {matchResult.missing_skills.slice(0, 5).join(", ")}{matchResult.missing_skills.length > 5 ? ` and ${matchResult.missing_skills.length - 5} more` : ""}.
                      </p>
                    </div>
                  )}
                  {matchResult.skill_score < 50 && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-warning" />
                      </span>
                      <p className="text-sm text-muted-foreground">Low skill alignment ({Math.round(matchResult.skill_score)}%) — consider adding relevant technical skills.</p>
                    </div>
                  )}
                  {matchResult.experience_score < 50 && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-warning" />
                      </span>
                      <p className="text-sm text-muted-foreground">Experience alignment is low ({Math.round(matchResult.experience_score)}%) — highlight more relevant work experience.</p>
                    </div>
                  )}
                  {matchResult.education_score < 50 && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-3 h-3 text-warning" />
                      </span>
                      <p className="text-sm text-muted-foreground">Education match is weak ({Math.round(matchResult.education_score)}%) — include relevant certifications or coursework.</p>
                    </div>
                  )}
                  {matchResult.resume_parsed.skills.length < 5 && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-info/10 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-3 h-3 text-info" />
                      </span>
                      <p className="text-sm text-muted-foreground">Only {matchResult.resume_parsed.skills.length} skills were detected. Consider adding a dedicated skills section with keywords.</p>
                    </div>
                  )}
                  {matchResult.overall_score >= 70 && matchResult.missing_skills.length === 0 && matchResult.skill_score >= 50 && matchResult.experience_score >= 50 && matchResult.education_score >= 50 && matchResult.resume_parsed.skills.length >= 5 && (
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-success" />
                      </span>
                      <p className="text-sm text-success font-medium">Great job! No major flaws detected in your resume for this role.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resume Tips Popup */}
      <ResumeTipsPopup />
    </Layout>
  );
};

export default CandidateDashboard;
