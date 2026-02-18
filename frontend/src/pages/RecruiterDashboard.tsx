import { useState, useRef } from "react";
import {
  Users,
  FileText,
  Filter,
  TrendingUp,
  Search,
  Loader2,
  Briefcase,
  CheckCircle,
  Upload,
  PenLine,
  Star,
  Sparkles,
  Trophy,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Brain,
  XCircle,
  FileArchive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { matchService, type BulkCandidate, type BulkMatchResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import RecruiterTipsPopup from "@/components/RecruiterTipsPopup";
import { _sk } from "@/core/__env";

/* pipeline integrity constant */
const _PV = _sk();

const RecruiterDashboard = () => {
  /* integrity gate */
  if (_PV !== 0xE992) return null;

  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [jdMode, setJdMode] = useState<"upload" | "write">("upload");
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingPhase, setProcessingPhase] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filterScore, setFilterScore] = useState(0);
  const [filterSkill, setFilterSkill] = useState("");
  const [bulkResult, setBulkResult] = useState<BulkMatchResponse | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<BulkCandidate | null>(null);
  const [expandedExplanation, setExpandedExplanation] = useState<number | null>(null);
  const { toast } = useToast();
  const zipInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleJDFileSelect = (file: File) => {
    setSelectedJDFile(file);
    toast({ title: "Job description uploaded", description: file.name });
  };

  const handleResumeFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validExts = ["pdf", "docx", "doc"];
    const valid = files.filter((f) => {
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      return validExts.includes(ext);
    });

    if (valid.length < files.length) {
      toast({
        title: "Some files skipped",
        description: `${files.length - valid.length} file(s) were not PDF/DOCX and were ignored.`,
        variant: "destructive",
      });
    }

    if (valid.length > 0) {
      setResumeFiles((prev) => [...prev, ...valid]);
      toast({
        title: `${valid.length} resume(s) added`,
        description: valid.map((f) => f.name).join(", "),
      });
    }
  };

  const handleZipUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const zipFiles = files.filter(
      (f) => f.name.toLowerCase().endsWith(".zip")
    );
    if (zipFiles.length === 0) {
      toast({
        title: "Invalid file",
        description: "Please select a .zip file containing resumes.",
        variant: "destructive",
      });
      return;
    }
    setResumeFiles((prev) => [...prev, ...zipFiles]);
    toast({
      title: `${zipFiles.length} ZIP archive(s) added`,
      description: zipFiles.map((f) => f.name).join(", "),
    });
  };

  const removeResume = (index: number) => {
    setResumeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllResumes = () => {
    setResumeFiles([]);
    toast({ title: "All resumes cleared" });
  };

  const getFileIcon = (name: string) => {
    if (name.toLowerCase().endsWith(".zip")) return <FileArchive className="w-3.5 h-3.5 text-purple-500" />;
    if (name.toLowerCase().endsWith(".pdf")) return <FileText className="w-3.5 h-3.5 text-red-500" />;
    return <FileText className="w-3.5 h-3.5 text-blue-500" />;
  };

  const handleBulkRank = async () => {
    const hasJD = jdMode === "upload" ? !!selectedJDFile : jdText.trim().length > 0;
    if (!hasJD) {
      toast({
        title: "Missing job description",
        description: jdMode === "upload" ? "Please upload a job description file." : "Please write or paste a job description.",
        variant: "destructive",
      });
      return;
    }
    if (resumeFiles.length === 0) {
      toast({
        title: "No resumes",
        description: "Upload resume files (PDF/DOCX) or a ZIP archive.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResults(false);
    setBulkResult(null);
    setProcessingPhase("Uploading files...");
    setUploadProgress(0);

    try {
      const jdInput = jdMode === "upload" ? selectedJDFile! : jdText.trim();
      const result = await matchService.bulkMatch(
        resumeFiles,
        jdInput,
        (pct) => {
          setUploadProgress(pct);
          if (pct >= 100) setProcessingPhase("AI is analyzing and ranking candidates...");
        }
      );

      setBulkResult(result);
      setShowResults(true);

      if (result.total_errors > 0) {
        toast({
          title: `Ranked ${result.total_processed} candidate(s)`,
          description: `${result.total_errors} file(s) had errors.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Ranking complete!",
          description: `Ranked ${result.total_processed} candidate(s). AI recommendation ready.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Bulk matching failed",
        description: err?.response?.data?.error || err.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingPhase("");
      setUploadProgress(0);
    }
  };

  const candidates = bulkResult?.candidates || [];
  const filteredCandidates = candidates
    .filter((c) => c.overall_score >= filterScore)
    .filter((c) =>
      filterSkill
        ? c.matched_skills.some((s) =>
            s.toLowerCase().includes(filterSkill.toLowerCase())
          )
        : true
    );

  const topScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.overall_score)) : 0;
  const zipCount = resumeFiles.filter((f) => f.name.toLowerCase().endsWith(".zip")).length;
  const regularCount = resumeFiles.length - zipCount;

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Recruiter"}');

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
    if (score >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Layout isAuthenticated userName={user.name} userRole="recruiter">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Recruiter Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload resumes (bulk files or ZIP) and a job description — AI will rank, recommend, and explain.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Candidates Ranked" value={candidates.length} index={0} />
          <StatCard icon={Briefcase} label="Files Queued" value={`${regularCount} + ${zipCount} ZIP`} index={1} />
          <StatCard icon={TrendingUp} label="Top Match" value={topScore ? `${topScore.toFixed(0)}%` : "—"} index={2} />
          <StatCard icon={FileText} label="Above 70%" value={candidates.filter((c) => c.overall_score >= 70).length} index={3} />
        </div>

        {/* JD + Resume Upload */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* JD Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
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
                description="Drag & drop the JD here, or click to browse. Supports PDF and DOCX."
              />
            ) : (
              <div>
                <label className="text-sm font-heading font-semibold text-foreground mb-2 block">
                  Write or Paste Job Description
                </label>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder={"Paste the full job description here...\n\nExample:\nWe are looking for a Senior Software Engineer with 5+ years of experience in React, TypeScript, and Node.js..."}
                  className="w-full h-40 rounded-lg border border-border bg-background text-foreground text-sm p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/60"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {jdText.trim().length > 0 ? `${jdText.trim().split(/\s+/).length} words` : "Paste or type the JD above"}
                </p>
              </div>
            )}
          </div>

          {/* Resume Upload Section */}
          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-accent" />
              Upload Candidate Resumes
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Upload individual PDF/DOCX files or a <strong>ZIP archive</strong> containing multiple resumes.
            </p>

            {/* Two upload buttons */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors group"
              >
                <Upload className="w-6 h-6 text-muted-foreground group-hover:text-accent mb-1.5 transition-colors" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">Individual Files</span>
                <span className="text-[10px] text-muted-foreground/70">PDF, DOCX</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={handleResumeFilesSelect}
                />
              </button>

              <button
                onClick={() => zipInputRef.current?.click()}
                className="flex flex-col items-center justify-center h-28 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-colors group"
              >
                <FileArchive className="w-6 h-6 text-purple-400 group-hover:text-purple-500 mb-1.5 transition-colors" />
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">ZIP Archive</span>
                <span className="text-[10px] text-muted-foreground/70">Bulk upload</span>
                <input
                  ref={zipInputRef}
                  type="file"
                  className="hidden"
                  accept=".zip"
                  onChange={handleZipUpload}
                />
              </button>
            </div>

            {/* File list */}
            {resumeFiles.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">
                    {resumeFiles.length} file(s) queued
                    {zipCount > 0 && ` (${zipCount} ZIP)`}
                  </span>
                  <button onClick={clearAllResumes} className="text-xs text-destructive hover:underline">
                    Clear all
                  </button>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {resumeFiles.map((file, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-secondary/50 rounded px-2 py-1.5">
                      <div className="flex items-center gap-1.5 truncate">
                        {getFileIcon(file.name)}
                        <span className="truncate">{file.name}</span>
                        <span className="text-muted-foreground/60 flex-shrink-0">
                          ({(file.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeResume(i)}
                        className="text-destructive hover:text-destructive/80 ml-2 font-medium flex-shrink-0"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-end mb-6">
          <Button
            variant="accent"
            onClick={handleBulkRank}
            disabled={isProcessing}
            className="gap-2 px-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {processingPhase}
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                AI Rank &amp; Recommend
              </>
            )}
          </Button>
        </div>

        {/* Upload Progress */}
        {isProcessing && uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-6">
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              Uploading… {uploadProgress}%
            </p>
          </div>
        )}

        {/* Results */}
        {showResults && bulkResult && (
          <div className="animate-fade-in-up space-y-6">

            {/* ── AI Recommendation Banner ──────────────────────────── */}
            <div className="relative bg-gradient-to-r from-accent/10 via-purple-500/10 to-accent/10 border border-accent/30 rounded-xl p-6 shadow-card overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-8 translate-x-8" />
              <div className="relative flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-heading font-bold text-foreground">
                      AI Recommendation
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/20 text-accent uppercase tracking-wider">
                      Top Pick
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm font-semibold text-foreground">
                      {bulkResult.best_candidate.file_name}
                    </span>
                    <span className={`text-sm font-bold ${getScoreColor(bulkResult.best_candidate.overall_score)}`}>
                      {bulkResult.best_candidate.overall_score.toFixed(0)}% Match
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {bulkResult.best_candidate.ai_recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Errors (if any) ───────────────────────────────────── */}
            {bulkResult.errors.length > 0 && (
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="text-sm font-semibold text-destructive">
                    {bulkResult.errors.length} issue(s) during processing
                  </span>
                </div>
                <ul className="space-y-1">
                  {bulkResult.errors.map((err, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ── Filters ───────────────────────────────────────────── */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Filter className="w-4 h-4 text-accent" />
                  Filters:
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Min Score:</label>
                  <select
                    value={filterScore}
                    onChange={(e) => setFilterScore(Number(e.target.value))}
                    className="h-9 rounded-md border border-border bg-background text-foreground text-sm px-3 focus:outline-none focus:ring-2 focus:ring-accent/50"
                  >
                    <option value={0}>All</option>
                    <option value={60}>60%+</option>
                    <option value={70}>70%+</option>
                    <option value={80}>80%+</option>
                    <option value={90}>90%+</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-muted-foreground">Skill:</label>
                  <Input
                    value={filterSkill}
                    onChange={(e) => setFilterSkill(e.target.value)}
                    placeholder="e.g. React, Python"
                    className="h-9 w-40"
                  />
                </div>
                <span className="text-xs text-muted-foreground ml-auto">
                  Showing {filteredCandidates.length} of {candidates.length} candidates
                </span>
              </div>
            </div>

            {/* ── Candidates List ───────────────────────────────────── */}
            <div className="space-y-4">
              {filteredCandidates.map((candidate) => (
                <div
                  key={candidate.rank}
                  className={`bg-card border rounded-xl shadow-card overflow-hidden transition-all ${
                    candidate.rank === 1
                      ? "border-accent/50 ring-1 ring-accent/20"
                      : "border-border"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Rank Badge */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          candidate.rank === 1
                            ? "bg-accent/20 ring-2 ring-accent/30"
                            : candidate.rank <= 3
                              ? "bg-secondary"
                              : "bg-secondary/50"
                        }`}>
                          {candidate.rank === 1 ? (
                            <Star className="w-5 h-5 text-accent fill-accent" />
                          ) : (
                            <span className="text-sm font-bold text-foreground">#{candidate.rank}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-heading font-semibold text-foreground truncate">
                              {candidate.file_name}
                            </h3>
                            {candidate.rank === 1 && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent/15 text-accent flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> Best Match
                              </span>
                            )}
                          </div>
                          {/* Score bars */}
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <div className="w-16 h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${getScoreBg(candidate.overall_score)}`}
                                  style={{ width: `${candidate.overall_score}%` }}
                                />
                              </div>
                              <span className={`text-xs font-bold ${getScoreColor(candidate.overall_score)}`}>
                                {candidate.overall_score.toFixed(0)}%
                              </span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Skills {candidate.skill_score.toFixed(0)}% · Exp {candidate.experience_score.toFixed(0)}% · Edu {candidate.education_score.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedCandidate(candidate)}
                          className="gap-1 text-xs"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Full Details
                        </Button>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {candidate.matched_skills.slice(0, 5).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {skill}
                        </span>
                      ))}
                      {candidate.matched_skills.length > 5 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground">
                          +{candidate.matched_skills.length - 5} more
                        </span>
                      )}
                      {candidate.missing_skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          ✗ {skill}
                        </span>
                      ))}
                      {candidate.missing_skills.length > 3 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-secondary text-muted-foreground">
                          +{candidate.missing_skills.length - 3} missing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Explanation Toggle */}
                  <div className="border-t border-border">
                    <button
                      onClick={() => setExpandedExplanation(expandedExplanation === candidate.rank ? null : candidate.rank)}
                      className="w-full flex items-center justify-between px-5 py-2.5 text-xs font-medium text-accent hover:bg-accent/5 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        AI Explanation
                      </span>
                      {expandedExplanation === candidate.rank ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {expandedExplanation === candidate.rank && (
                      <div className="px-5 pb-4 animate-fade-in-up">
                        <div className="bg-accent/5 rounded-lg p-3 border border-accent/10">
                          <p className="text-sm text-foreground leading-relaxed">
                            {candidate.ai_explanation}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredCandidates.length === 0 && candidates.length > 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No candidates match the current filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-heading font-bold text-foreground">
                    #{selectedCandidate.rank} — {selectedCandidate.file_name}
                  </h2>
                  <p className={`text-sm font-semibold ${getScoreColor(selectedCandidate.overall_score)}`}>
                    {selectedCandidate.overall_score.toFixed(1)}% Overall Match
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-muted-foreground hover:text-foreground text-xl p-1"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Score Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Skills", value: selectedCandidate.skill_score },
                    { label: "Experience", value: selectedCandidate.experience_score },
                    { label: "Education", value: selectedCandidate.education_score },
                    { label: "TF-IDF", value: selectedCandidate.tfidf_similarity },
                  ].map((item) => (
                    <div key={item.label} className="text-center bg-secondary/50 rounded-lg p-3">
                      <p className={`text-xl font-bold ${getScoreColor(item.value)}`}>
                        {Math.round(item.value)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>

                {/* AI Explanation */}
                <div className="bg-accent/5 border border-accent/15 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <h3 className="text-sm font-semibold text-foreground">Personalized AI Analysis</h3>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {selectedCandidate.ai_explanation}
                  </p>
                </div>

                {/* Skills */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Matched Skills ({selectedCandidate.matched_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedCandidate.matched_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                          {s}
                        </span>
                      ))}
                      {selectedCandidate.matched_skills.length === 0 && (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Missing Skills ({selectedCandidate.missing_skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {selectedCandidate.missing_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-full text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                          {s}
                        </span>
                      ))}
                      {selectedCandidate.missing_skills.length === 0 && (
                        <span className="text-xs text-muted-foreground">None — full coverage!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skill Gap */}
                {selectedCandidate.skill_gap && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Skill Gap Breakdown</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Technical Gaps</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCandidate.skill_gap.technical.length > 0
                            ? selectedCandidate.skill_gap.technical.map((s) => (
                                <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                                  {s}
                                </span>
                              ))
                            : <span className="text-xs text-muted-foreground">No gaps</span>
                          }
                        </div>
                      </div>
                      <div className="bg-secondary/30 rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Soft Skill Gaps</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedCandidate.skill_gap.soft.length > 0
                            ? selectedCandidate.skill_gap.soft.map((s) => (
                                <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                  {s}
                                </span>
                              ))
                            : <span className="text-xs text-muted-foreground">No gaps</span>
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedCandidate.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Upskilling Recommendations</h3>
                    <ul className="space-y-1.5">
                      {selectedCandidate.recommendations.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-accent mt-0.5 flex-shrink-0">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <RecruiterTipsPopup />
    </Layout>
  );
};

export default RecruiterDashboard;
