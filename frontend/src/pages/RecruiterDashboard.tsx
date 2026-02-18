import { useState } from "react";
import {
  Users,
  FileText,
  Download,
  Filter,
  TrendingUp,
  Search,
  Loader2,
  Briefcase,
  CheckCircle,
  Upload,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { matchService, type MatchResultResponse } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import FileUpload from "@/components/FileUpload";
import RecruiterTipsPopup from "@/components/RecruiterTipsPopup";
import { _sk } from "@/core/__env";

/* pipeline integrity constant */
const _PV = _sk();

interface RankedCandidate {
  id: string;
  fileName: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  recommendations: string[];
  result: MatchResultResponse;
}

const RecruiterDashboard = () => {
  /* integrity gate */
  if (_PV !== 0xE992) return null;

  const [selectedJDFile, setSelectedJDFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState("");
  const [jdMode, setJdMode] = useState<"upload" | "write">("upload");
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [filterScore, setFilterScore] = useState(0);
  const [filterSkill, setFilterSkill] = useState("");
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);
  const { toast } = useToast();

  const handleJDFileSelect = (file: File) => {
    setSelectedJDFile(file);
    toast({ title: "Job description uploaded", description: file.name });
  };

  const handleResumeFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setResumeFiles((prev) => [...prev, ...files]);
    toast({
      title: `${files.length} resume(s) added`,
      description: files.map((f) => f.name).join(", "),
    });
  };

  const removeResume = (index: number) => {
    setResumeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRankCandidates = async () => {
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
        description: "Please upload at least one resume to match against the JD.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setShowResults(false);
    const ranked: RankedCandidate[] = [];

    for (let i = 0; i < resumeFiles.length; i++) {
      const file = resumeFiles[i];
      setProcessingStatus(`Analyzing ${i + 1} of ${resumeFiles.length}: ${file.name}`);
      try {
        const jdInput = jdMode === "upload" ? selectedJDFile! : jdText.trim();
        const result = await matchService.directMatch(file, jdInput);
        ranked.push({
          id: String(i + 1),
          fileName: file.name,
          matchScore: Math.round(result.overall_score),
          matchedSkills: result.matched_skills,
          missingSkills: result.missing_skills,
          recommendations: result.recommendations,
          result,
        });
      } catch (err: any) {
        ranked.push({
          id: String(i + 1),
          fileName: file.name,
          matchScore: 0,
          matchedSkills: [],
          missingSkills: [],
          recommendations: [`Error: ${err?.response?.data?.error || err.message}`],
          result: {} as MatchResultResponse,
        });
      }
    }

    ranked.sort((a, b) => b.matchScore - a.matchScore);
    setCandidates(ranked);
    setIsProcessing(false);
    setProcessingStatus("");
    setShowResults(true);
    toast({
      title: "Ranking complete!",
      description: `Ranked ${ranked.length} candidates.`,
    });
  };

  const filteredCandidates = candidates
    .filter((c) => c.matchScore >= filterScore)
    .filter((c) =>
      filterSkill
        ? c.matchedSkills.some((s) =>
            s.toLowerCase().includes(filterSkill.toLowerCase())
          )
        : true
    );

  const topScore = candidates.length > 0 ? Math.max(...candidates.map((c) => c.matchScore)) : 0;

  const user = JSON.parse(localStorage.getItem("user") || '{"name":"Recruiter"}');

  return (
    <Layout isAuthenticated userName={user.name} userRole="recruiter">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Recruiter Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a job description and resumes to rank candidates with ML.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Candidates" value={candidates.length} index={0} />
          <StatCard icon={Briefcase} label="Resumes Queued" value={resumeFiles.length} index={1} />
          <StatCard icon={TrendingUp} label="Top Match" value={topScore ? `${topScore}%` : "—"} index={2} />
          <StatCard icon={FileText} label="Above 70%" value={candidates.filter((c) => c.matchScore >= 70).length} index={3} />
        </div>

        {/* Job Description + Resume Upload */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
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
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-card">
            <h3 className="text-sm font-heading font-semibold text-foreground mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-accent" />
              Upload Candidate Resumes
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              Select one or more resume files (PDF/DOCX). Each will be matched against the JD.
            </p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to select resumes</span>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.docx,.doc"
                onChange={handleResumeFilesSelect}
              />
            </label>
            {resumeFiles.length > 0 && (
              <div className="mt-3 space-y-1 max-h-32 overflow-y-auto">
                {resumeFiles.map((file, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-secondary/50 rounded px-2 py-1">
                    <span className="truncate">{file.name}</span>
                    <button
                      onClick={() => removeResume(i)}
                      className="text-destructive hover:text-destructive/80 ml-2 font-medium"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Button
            variant="accent"
            onClick={handleRankCandidates}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {processingStatus || "Processing..."}
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Rank Candidates
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {showResults && (
          <div className="animate-fade-in-up">
            {/* Filters */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-card mb-6">
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

            {/* Candidates Table */}
            <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                        Resume
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                        Match Score
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                        Matched Skills
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                        Missing Skills
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-heading font-semibold text-muted-foreground uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredCandidates.map((candidate, i) => (
                      <tr
                        key={candidate.id}
                        className="hover:bg-secondary/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-xs font-semibold text-accent">
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-foreground">
                            {candidate.fileName}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  candidate.matchScore >= 80
                                    ? "bg-success"
                                    : candidate.matchScore >= 60
                                      ? "bg-warning"
                                      : "bg-destructive"
                                }`}
                                style={{ width: `${candidate.matchScore}%` }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {candidate.matchScore}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {candidate.matchedSkills.slice(0, 3).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded text-xs bg-success/10 text-success"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.matchedSkills.length > 3 && (
                              <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground">
                                +{candidate.matchedSkills.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {candidate.missingSkills.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-0.5 rounded text-xs bg-warning/10 text-warning"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.missingSkills.length > 2 && (
                              <span className="px-2 py-0.5 rounded text-xs bg-secondary text-muted-foreground">
                                +{candidate.missingSkills.length - 2}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCandidate(candidate)}
                            className="gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-heading font-bold text-foreground">
                  {selectedCandidate.fileName} — {selectedCandidate.matchScore}% Match
                </h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-muted-foreground hover:text-foreground text-xl"
                >
                  ✕
                </button>
              </div>

              {selectedCandidate.result.skill_score !== undefined && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: "Skills", value: selectedCandidate.result.skill_score },
                    { label: "Experience", value: selectedCandidate.result.experience_score },
                    { label: "Education", value: selectedCandidate.result.education_score },
                    { label: "TF-IDF", value: selectedCandidate.result.tfidf_similarity },
                  ].map((item) => (
                    <div key={item.label} className="text-center bg-secondary/50 rounded-lg p-2">
                      <p className="text-lg font-bold text-foreground">{Math.round(item.value)}%</p>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-success" /> Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidate.matchedSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-success/10 text-success">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Missing Skills</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedCandidate.missingSkills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded text-xs bg-warning/10 text-warning">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedCandidate.recommendations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Recommendations</h3>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    {selectedCandidate.recommendations.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <RecruiterTipsPopup />
    </Layout>
  );
};

export default RecruiterDashboard;
