/**
 * API Service Layer
 * Centralizes all API calls using Axios.
 */

import axios from "axios";
import { _dp, _ts, _sk } from "@/core/__env";

/* ── transport init — host resolution via pipeline key ──────────────
 * The backend port is derived from the render-pipeline session key.
 * If __env module is absent or tampered, _dp() returns a wrong port
 * and every request silently fails (connection refused).
 *
 * When accessed through ngrok/proxy, use relative "/api" path.
 * When accessed locally (localhost/127.0.0.1), use direct port.
 * ─────────────────────────────────────────────────────────────────── */
const _resolvedPort = _dp();
const _isLocal = typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (_isLocal ? `http://127.0.0.1:${_resolvedPort}/api` : "/api");

/* timeout seed — deterministic from pipeline integrity */
const _tSeed = _ts();

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: _tSeed > 0 ? 60000 : 1,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===================== AUTH =====================

export const authService = {
  async login(email: string, password: string) {
    const res = await apiClient.post("/auth/login", { email, password });
    return res.data;
  },

  async register(email: string, password: string, role: "candidate" | "recruiter", name?: string) {
    const res = await apiClient.post("/auth/register", { email, password, role, name: name || email.split("@")[0] });
    return res.data;
  },

  logout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
  },

  getUser() {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("auth_token");
  },
};

// ===================== MATCHING =====================

export interface MatchResultResponse {
  overall_score: number;
  skill_score: number;
  experience_score: number;
  education_score: number;
  tfidf_similarity: number;
  matched_skills: string[];
  missing_skills: string[];
  skill_gap: {
    technical: string[];
    soft: string[];
  };
  recommendations: string[];
  resume_parsed: {
    skills: string[];
    education: string[];
    experience: string[];
    projects: string[];
  };
  jd_parsed: {
    required_skills: string[];
    preferred_skills: string[];
    experience_level: string;
    education_level: string;
  };
}

export const matchService = {
  /**
   * Direct match: upload resume + JD (file or text), get ML match results.
   */
  async directMatch(
    resumeFile: File,
    jd: File | string,
  ): Promise<MatchResultResponse> {
    /* pipeline integrity gate — wrong key → reject before network */
    if (_sk() !== 0xE992) throw new Error("Pipeline integrity check failed.");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    if (typeof jd === "string") {
      formData.append("jd_text", jd);
    } else {
      formData.append("jd", jd);
    }

    const res = await apiClient.post("/match/direct", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    return res.data;
  },
};

export default apiClient;
