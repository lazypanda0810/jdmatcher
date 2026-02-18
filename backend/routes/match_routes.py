"""
routes/match_routes.py - Matching API Endpoints
--------------------------------------------------
Exposes RESTful endpoints for AI-based resume–JD matching:

  POST /api/match/analyze         - Run matching between a resume and JD
  GET  /api/match/history         - Get all past match results for the user
  GET  /api/match/<match_id>      - Get a specific match result
  GET  /api/match/job/<job_id>    - Get all matches for a job (recruiter)
  POST /api/match/skillgap        - Run standalone skill gap analysis

Protected by JWT authentication.
"""

import os
import zipfile
import tempfile
import shutil

from flask import Blueprint, request, jsonify, g
from services.match_service import MatchService
from ml.skill_gap_analyzer import SkillGapAnalyzer
from ml.matching_engine import MatchingEngine
from ml.resume_parser import ResumeParser
from ml.jd_parser import JDParser
from ml.ai_engine import AIEngine
from models.resume import ResumeModel
from utils.auth import token_required, role_required
from utils.file_handler import save_uploaded_file, extract_text, allowed_file

match_bp = Blueprint("match", __name__, url_prefix="/api/match")


def init_match_routes(db):
    """
    Factory function to initialize match routes with a database connection.

    Args:
        db: PyMongo database instance.

    Returns:
        Blueprint: Configured match blueprint.
    """
    service = MatchService(db)
    resume_model = ResumeModel(db)
    skill_gap_analyzer = SkillGapAnalyzer()

    # ── POST /api/match/analyze ──────────────────────────────────────────
    @match_bp.route("/analyze", methods=["POST"])
    @token_required
    def analyze_match():
        """
        Run AI matching between a resume and a job description.

        Uses TF-IDF vectorization + cosine similarity + weighted scoring
        to produce an explainable match score (0–100).

        Request Body (JSON):
            {
                "resume_id": "64f...",
                "job_id": "64f..."
            }

        Response (200):
            {
                "message": "Matching completed successfully.",
                "match_id": "64f...",
                "result": {
                    "overall_score": 72.5,
                    "skill_score": 80.0,
                    "experience_score": 60.0,
                    "education_score": 100.0,
                    "tfidf_similarity": 45.3,
                    "matched_skills": ["python", "django", "sql"],
                    "missing_skills": ["docker", "kubernetes"],
                    "skill_gap": {
                        "technical": ["docker", "kubernetes"],
                        "soft": []
                    },
                    "recommendations": [
                        "[HIGH] Docker: Containerize a sample app...",
                        "[HIGH] Kubernetes: Complete Kubernetes basics..."
                    ]
                }
            }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body must be JSON."}), 400

            user_id = g.user["user_id"]
            response, status_code = service.match_resume_to_job(user_id, data)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Matching failed: {str(e)}"}), 500

    # ── GET /api/match/history ───────────────────────────────────────────
    @match_bp.route("/history", methods=["GET"])
    @token_required
    def match_history():
        """
        Retrieve all past match results for the authenticated user.

        Response (200):
            {
                "matches": [
                    {
                        "id": "...",
                        "resume_id": "...",
                        "job_id": "...",
                        "overall_score": 72.5,
                        ...
                    }
                ]
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.get_match_history(user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to get history: {str(e)}"}), 500

    # ── GET /api/match/<match_id> ────────────────────────────────────────
    @match_bp.route("/<match_id>", methods=["GET"])
    @token_required
    def get_match(match_id):
        """
        Get detailed results for a specific match.

        Response (200):
            {
                "match": {
                    "id": "...",
                    "overall_score": 72.5,
                    "skill_gap": {...},
                    "recommendations": [...],
                    ...
                }
            }
        """
        try:
            response, status_code = service.get_match_by_id(match_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to retrieve match: {str(e)}"}), 500

    # ── GET /api/match/job/<job_id> ──────────────────────────────────────
    @match_bp.route("/job/<job_id>", methods=["GET"])
    @token_required
    @role_required("Recruiter", "Admin")
    def get_matches_for_job(job_id):
        """
        Get all candidate matches for a specific job (recruiter view).
        Sorted by overall_score descending.

        Response (200):
            {
                "matches": [...]
            }
        """
        try:
            response, status_code = service.get_matches_for_job(job_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to get matches: {str(e)}"}), 500

    # ── POST /api/match/skillgap ─────────────────────────────────────────
    @match_bp.route("/skillgap", methods=["POST"])
    @token_required
    def analyze_skill_gap():
        """
        Standalone skill gap analysis.

        Can be used with explicit skill lists or with resume/job IDs.

        Request Body (JSON) - Option 1 (explicit skills):
            {
                "candidate_skills": ["python", "flask", "sql"],
                "required_skills": ["python", "django", "docker"],
                "preferred_skills": ["kubernetes", "aws"]
            }

        Request Body (JSON) - Option 2 (from resume):
            {
                "resume_id": "64f...",
                "required_skills": ["python", "django"],
                "preferred_skills": ["docker"]
            }

        Response (200):
            {
                "skill_gap": {
                    "technical": ["django", "docker", "kubernetes", "aws"],
                    "soft": []
                },
                "recommendations": [...]
            }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body must be JSON."}), 400

            # Get candidate skills from explicit list or from a resume
            candidate_skills = data.get("candidate_skills", [])
            if not candidate_skills and data.get("resume_id"):
                resume = resume_model.find_by_id(data["resume_id"])
                if resume:
                    candidate_skills = resume.get("parsed_data", {}).get("skills", [])

            required_skills = data.get("required_skills", [])
            preferred_skills = data.get("preferred_skills", [])

            if not candidate_skills:
                return jsonify({"error": "No candidate skills provided."}), 400
            if not required_skills and not preferred_skills:
                return jsonify({"error": "No job skills provided."}), 400

            result = skill_gap_analyzer.analyze(
                candidate_skills, required_skills, preferred_skills
            )
            return jsonify(result), 200

        except Exception as e:
            return jsonify({"error": f"Skill gap analysis failed: {str(e)}"}), 500

    # ── POST /api/match/direct ───────────────────────────────────────────
    @match_bp.route("/direct", methods=["POST"])
    def direct_match():
        """
        Direct file-based matching: upload resume + JD files in one request.
        No authentication required — open endpoint for quick matching.

        Request:
            Content-Type: multipart/form-data
            Fields:
                "resume" - Resume file (PDF/DOCX)
                "jd"     - Job description file (PDF/DOCX)

        Response (200):
            {
                "overall_score": 72.5,
                "skill_score": 80.0,
                "experience_score": 60.0,
                "education_score": 100.0,
                "tfidf_similarity": 45.3,
                "matched_skills": [...],
                "missing_skills": [...],
                "skill_gap": { "technical": [...], "soft": [...] },
                "recommendations": [...],
                "resume_parsed": { "skills": [...], ... },
                "jd_parsed": { "required_skills": [...], ... }
            }
        """
        try:
            if "resume" not in request.files:
                return jsonify({"error": "No resume file provided. Use 'resume' field."}), 400

            resume_file = request.files["resume"]

            # Save and extract resume text
            resume_path, resume_name = save_uploaded_file(resume_file)
            if not resume_path:
                return jsonify({"error": "Invalid resume file. Only PDF and DOCX allowed."}), 400

            resume_text = extract_text(resume_path)
            if not resume_text.strip():
                return jsonify({"error": "Could not extract text from resume file."}), 400

            # JD: accept either file upload OR raw text
            jd_text = ""
            if "jd" in request.files and request.files["jd"].filename:
                jd_file = request.files["jd"]
                jd_path, jd_name = save_uploaded_file(jd_file)
                if not jd_path:
                    return jsonify({"error": "Invalid JD file. Only PDF and DOCX allowed."}), 400
                jd_text = extract_text(jd_path)
            elif request.form.get("jd_text", "").strip():
                jd_text = request.form["jd_text"].strip()
            else:
                return jsonify({"error": "No JD provided. Upload a file ('jd') or send text ('jd_text')."}), 400

            if not jd_text.strip():
                return jsonify({"error": "Could not extract text from JD."}), 400

            # Parse both documents with NLP
            resume_parser = ResumeParser()
            jd_parser = JDParser()

            resume_parsed = resume_parser.parse(resume_text)
            jd_parsed = jd_parser.parse(jd_text)

            # Run matching engine
            engine = MatchingEngine()
            match_result = engine.compute_match(
                resume_text=resume_text,
                job_text=jd_text,
                resume_skills=resume_parsed.get("skills", []),
                job_required_skills=jd_parsed.get("required_skills", []),
                job_preferred_skills=jd_parsed.get("preferred_skills", []),
                resume_experience=resume_parsed.get("experience", []),
                job_experience_level=jd_parsed.get("experience_level", ""),
                resume_education=resume_parsed.get("education", []),
                job_education_level=jd_parsed.get("education_level", ""),
            )

            # Skill gap analysis
            analyzer = SkillGapAnalyzer()
            skill_gap = analyzer.analyze(
                candidate_skills=resume_parsed.get("skills", []),
                required_skills=jd_parsed.get("required_skills", []),
                preferred_skills=jd_parsed.get("preferred_skills", []),
            )

            return jsonify({
                "overall_score": match_result["overall_score"],
                "skill_score": match_result["skill_score"],
                "experience_score": match_result["experience_score"],
                "education_score": match_result["education_score"],
                "tfidf_similarity": match_result["tfidf_similarity"],
                "matched_skills": match_result["matched_skills"],
                "missing_skills": match_result["missing_skills"],
                "skill_gap": skill_gap["skill_gap"],
                "recommendations": skill_gap["recommendations"],
                "resume_parsed": resume_parsed,
                "jd_parsed": jd_parsed,
            }), 200

        except Exception as e:
            return jsonify({"error": f"Direct matching failed: {str(e)}"}), 500

    # ── POST /api/match/bulk ─────────────────────────────────────────────
    @match_bp.route("/bulk", methods=["POST"])
    def bulk_match():
        """
        Bulk matching: upload multiple resumes (individual files and/or ZIP archives)
        along with a JD, rank all candidates, generate AI recommendation for the
        best fit with personalized explanations for every candidate.

        Request:
            Content-Type: multipart/form-data
            Fields:
                "jd"      - Job description file (PDF/DOCX)   [optional if jd_text given]
                "jd_text" - Job description as plain text      [optional if jd given]
                "resumes" - One or more resume files (PDF/DOCX/ZIP), may repeat

        Response (200):
            {
                "candidates": [
                    {
                        "rank": 1,
                        "file_name": "alice_resume.pdf",
                        "overall_score": 85.2,
                        "skill_score": 90.0,
                        "experience_score": 75.0,
                        "education_score": 100.0,
                        "tfidf_similarity": 55.0,
                        "matched_skills": [...],
                        "missing_skills": [...],
                        "skill_gap": {...},
                        "recommendations": [...],
                        "ai_explanation": "Alice is the strongest match because...",
                        "resume_parsed": {...},
                        "jd_parsed": {...}
                    },
                    ...
                ],
                "best_candidate": {
                    "file_name": "alice_resume.pdf",
                    "overall_score": 85.2,
                    "ai_recommendation": "Based on comprehensive analysis, Alice..."
                },
                "total_processed": 5,
                "total_errors": 0,
                "errors": []
            }
        """
        try:
            # ── Parse JD ─────────────────────────────────────────────────
            jd_text = ""
            if "jd" in request.files and request.files["jd"].filename:
                jd_file = request.files["jd"]
                jd_path, _ = save_uploaded_file(jd_file)
                if not jd_path:
                    return jsonify({"error": "Invalid JD file. Only PDF and DOCX allowed."}), 400
                jd_text = extract_text(jd_path)
            elif request.form.get("jd_text", "").strip():
                jd_text = request.form["jd_text"].strip()
            else:
                return jsonify({"error": "No JD provided. Upload a file ('jd') or send text ('jd_text')."}), 400

            if not jd_text.strip():
                return jsonify({"error": "Could not extract text from JD."}), 400

            # ── Collect resume files (expand ZIPs) ───────────────────────
            resume_files = request.files.getlist("resumes")
            if not resume_files:
                return jsonify({"error": "No resume files provided. Use 'resumes' field."}), 400

            resume_entries = []   # list of (filepath, original_name)
            temp_dirs = []        # temp dirs to clean up later
            errors = []

            for f in resume_files:
                if not f or not f.filename:
                    continue
                ext = f.filename.rsplit(".", 1)[-1].lower() if "." in f.filename else ""

                if ext == "zip":
                    # Extract ZIP and collect inner PDF/DOCX files
                    tmp_dir = tempfile.mkdtemp(prefix="jdmatch_zip_")
                    temp_dirs.append(tmp_dir)
                    zip_path = os.path.join(tmp_dir, "upload.zip")
                    f.save(zip_path)
                    try:
                        with zipfile.ZipFile(zip_path, "r") as zf:
                            zf.extractall(tmp_dir)
                        # Walk extracted directory for valid resume files
                        for root, _dirs, files in os.walk(tmp_dir):
                            for fname in files:
                                if fname.startswith("__") or fname.startswith("."):
                                    continue
                                fext = fname.rsplit(".", 1)[-1].lower() if "." in fname else ""
                                if fext in ("pdf", "docx"):
                                    full = os.path.join(root, fname)
                                    resume_entries.append((full, fname))
                    except zipfile.BadZipFile:
                        errors.append(f"'{f.filename}' is not a valid ZIP file.")
                elif ext in ("pdf", "docx"):
                    saved_path, orig_name = save_uploaded_file(f)
                    if saved_path:
                        resume_entries.append((saved_path, orig_name))
                    else:
                        errors.append(f"Failed to save '{f.filename}'.")
                else:
                    errors.append(f"'{f.filename}' is not a supported format (PDF, DOCX, or ZIP).")

            if not resume_entries:
                # Cleanup
                for d in temp_dirs:
                    shutil.rmtree(d, ignore_errors=True)
                return jsonify({
                    "error": "No valid resume files found.",
                    "details": errors,
                }), 400

            # ── Parse JD once ────────────────────────────────────────────
            jd_parser = JDParser()
            jd_parsed = jd_parser.parse(jd_text)

            # ── Process each resume ──────────────────────────────────────
            resume_parser = ResumeParser()
            engine = MatchingEngine()
            analyzer = SkillGapAnalyzer()

            candidates = []
            resume_texts_for_ai = []

            for filepath, filename in resume_entries:
                try:
                    resume_text = extract_text(filepath)
                    if not resume_text.strip():
                        errors.append(f"Could not extract text from '{filename}'.")
                        continue

                    resume_parsed = resume_parser.parse(resume_text)
                    match_result = engine.compute_match(
                        resume_text=resume_text,
                        job_text=jd_text,
                        resume_skills=resume_parsed.get("skills", []),
                        job_required_skills=jd_parsed.get("required_skills", []),
                        job_preferred_skills=jd_parsed.get("preferred_skills", []),
                        resume_experience=resume_parsed.get("experience", []),
                        job_experience_level=jd_parsed.get("experience_level", ""),
                        resume_education=resume_parsed.get("education", []),
                        job_education_level=jd_parsed.get("education_level", ""),
                    )

                    skill_gap = analyzer.analyze(
                        candidate_skills=resume_parsed.get("skills", []),
                        required_skills=jd_parsed.get("required_skills", []),
                        preferred_skills=jd_parsed.get("preferred_skills", []),
                    )

                    candidates.append({
                        "file_name": filename,
                        "overall_score": match_result["overall_score"],
                        "skill_score": match_result["skill_score"],
                        "experience_score": match_result["experience_score"],
                        "education_score": match_result["education_score"],
                        "tfidf_similarity": match_result["tfidf_similarity"],
                        "matched_skills": match_result["matched_skills"],
                        "missing_skills": match_result["missing_skills"],
                        "skill_gap": skill_gap["skill_gap"],
                        "recommendations": skill_gap["recommendations"],
                        "resume_parsed": resume_parsed,
                        "jd_parsed": jd_parsed,
                    })
                    resume_texts_for_ai.append(resume_text)

                except Exception as e:
                    errors.append(f"Error processing '{filename}': {str(e)}")

            # Cleanup temp dirs
            for d in temp_dirs:
                shutil.rmtree(d, ignore_errors=True)

            if not candidates:
                return jsonify({
                    "error": "No resumes could be processed successfully.",
                    "details": errors,
                }), 400

            # ── Sort by overall_score descending ─────────────────────────
            candidates.sort(key=lambda c: c["overall_score"], reverse=True)

            # ── Generate AI Explanations ─────────────────────────────────
            _generate_ai_explanations(candidates, jd_text, jd_parsed)

            # Add rank numbers
            for i, c in enumerate(candidates):
                c["rank"] = i + 1

            # ── Best candidate recommendation ────────────────────────────
            best = candidates[0]
            best_rec = _build_best_recommendation(best, candidates, jd_parsed)

            return jsonify({
                "candidates": candidates,
                "best_candidate": {
                    "file_name": best["file_name"],
                    "overall_score": best["overall_score"],
                    "ai_recommendation": best_rec,
                },
                "total_processed": len(candidates),
                "total_errors": len(errors),
                "errors": errors,
            }), 200

        except Exception as e:
            return jsonify({"error": f"Bulk matching failed: {str(e)}"}), 500

    return match_bp


# ═══════════════════════════════════════════════════════════════════════
# Helper functions for AI explanations (outside the blueprint factory)
# ═══════════════════════════════════════════════════════════════════════

def _generate_ai_explanations(candidates, jd_text, jd_parsed):
    """
    Generate a personalised AI explanation for each candidate explaining
    why they rank where they do relative to the JD.
    """
    required = jd_parsed.get("required_skills", [])
    preferred = jd_parsed.get("preferred_skills", [])
    exp_level = jd_parsed.get("experience_level", "")
    edu_level = jd_parsed.get("education_level", "")

    for c in candidates:
        parts = []
        score = c["overall_score"]
        matched = c["matched_skills"]
        missing = c["missing_skills"]
        skill_sc = c["skill_score"]
        exp_sc = c["experience_score"]
        edu_sc = c["education_score"]

        # ── Opening assessment ───────────────────────────────────────
        if score >= 85:
            parts.append(f"{c['file_name']} is an excellent fit for this role with a {score:.0f}% overall match.")
        elif score >= 70:
            parts.append(f"{c['file_name']} is a strong candidate with a {score:.0f}% match, showing good alignment with the job requirements.")
        elif score >= 55:
            parts.append(f"{c['file_name']} is a moderate match at {score:.0f}%, meeting some key requirements but with notable gaps.")
        else:
            parts.append(f"{c['file_name']} has a {score:.0f}% match and may need significant upskilling to meet the role's demands.")

        # ── Skills analysis ──────────────────────────────────────────
        if matched:
            core_matched = [s for s in matched if s.lower() in [r.lower() for r in required]]
            pref_matched = [s for s in matched if s.lower() in [p.lower() for p in preferred]]
            if core_matched:
                parts.append(f"They demonstrate proficiency in {len(core_matched)} core required skill(s): {', '.join(core_matched[:5])}.")
            if pref_matched:
                parts.append(f"Additionally, they bring {len(pref_matched)} preferred skill(s): {', '.join(pref_matched[:4])}.")
            if not core_matched and not pref_matched and matched:
                parts.append(f"They possess relevant skills ({', '.join(matched[:4])}) that align with the role.")

        if missing:
            critical_missing = [s for s in missing if s.lower() in [r.lower() for r in required]]
            if critical_missing:
                parts.append(f"However, they are missing {len(critical_missing)} critical required skill(s): {', '.join(critical_missing[:4])}.")
            elif missing:
                parts.append(f"They are missing some preferred skills: {', '.join(missing[:3])}.")

        # ── Experience analysis ──────────────────────────────────────
        if exp_sc >= 80:
            if exp_level:
                parts.append(f"Their experience level aligns well with the {exp_level} requirement (score: {exp_sc:.0f}%).")
            else:
                parts.append(f"They have strong relevant experience (score: {exp_sc:.0f}%).")
        elif exp_sc >= 50:
            parts.append(f"Their experience partially meets expectations (score: {exp_sc:.0f}%).")
        else:
            parts.append(f"Experience is a concern area with a score of {exp_sc:.0f}%.")

        # ── Education analysis ───────────────────────────────────────
        if edu_sc >= 80:
            parts.append(f"Education requirements are well satisfied (score: {edu_sc:.0f}%).")
        elif edu_sc >= 50:
            parts.append(f"Education partially meets the requirement (score: {edu_sc:.0f}%).")

        # ── Final verdict ────────────────────────────────────────────
        strengths = []
        if skill_sc >= 75:
            strengths.append("technical skills")
        if exp_sc >= 75:
            strengths.append("experience")
        if edu_sc >= 75:
            strengths.append("education")
        if strengths:
            parts.append(f"Key strengths: {', '.join(strengths)}.")

        c["ai_explanation"] = " ".join(parts)


def _build_best_recommendation(best, all_candidates, jd_parsed):
    """
    Build a comprehensive AI recommendation for the top-ranked candidate.
    """
    parts = []
    parts.append(
        f"Based on comprehensive AI analysis of {len(all_candidates)} candidate(s), "
        f"'{best['file_name']}' is the top recommendation with a {best['overall_score']:.0f}% overall match."
    )

    if best["matched_skills"]:
        parts.append(
            f"This candidate demonstrates the strongest alignment with the required skill set, "
            f"matching {len(best['matched_skills'])} skill(s) including "
            f"{', '.join(best['matched_skills'][:5])}."
        )

    if len(all_candidates) > 1:
        second = all_candidates[1]
        gap = best["overall_score"] - second["overall_score"]
        if gap > 10:
            parts.append(
                f"They lead the next closest candidate ('{second['file_name']}') by {gap:.0f} percentage points, "
                f"indicating a clear advantage."
            )
        elif gap > 0:
            parts.append(
                f"The margin over the runner-up ('{second['file_name']}' at {second['overall_score']:.0f}%) "
                f"is narrow ({gap:.0f} pts), so both are worth considering."
            )
        else:
            parts.append(
                f"'{second['file_name']}' scored equally and is also worth strong consideration."
            )

    if best["missing_skills"]:
        parts.append(
            f"Note: Even the top candidate is missing {len(best['missing_skills'])} skill(s) "
            f"({', '.join(best['missing_skills'][:3])}). "
            f"Consider evaluating trainability during the interview."
        )
    else:
        parts.append("This candidate meets all identified skill requirements — a rare and ideal match.")

    # Hiring readiness
    if best["overall_score"] >= 85:
        parts.append("Recommendation: Proceed directly to interview.")
    elif best["overall_score"] >= 70:
        parts.append("Recommendation: Strong shortlist candidate. Schedule a technical screening.")
    elif best["overall_score"] >= 55:
        parts.append("Recommendation: Potential fit with development. Conduct a skills assessment first.")
    else:
        parts.append("Recommendation: Consider broadening the candidate pool for a better match.")

    return " ".join(parts)
