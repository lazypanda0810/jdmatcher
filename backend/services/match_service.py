"""
services/match_service.py - Matching Business Logic
------------------------------------------------------
Orchestrates the full resume ↔ job description matching pipeline:
  1. Retrieve parsed resume and JD data.
  2. Invoke the AI matching engine for TF-IDF + cosine similarity scoring.
  3. Compute weighted overall score.
  4. Invoke skill-gap analyzer.
  5. Persist match result.
  6. Return explainable scores and recommendations.
"""

from models.resume import ResumeModel
from models.job import JobModel
from models.match import MatchModel
from ml.matching_engine import MatchingEngine
from ml.skill_gap_analyzer import SkillGapAnalyzer


class MatchService:
    """Business logic for AI-based resume–JD matching."""

    def __init__(self, db):
        self.resume_model = ResumeModel(db)
        self.job_model = JobModel(db)
        self.match_model = MatchModel(db)
        self.matching_engine = MatchingEngine()
        self.skill_gap_analyzer = SkillGapAnalyzer()

    # ── Core Matching ────────────────────────────────────────────────────
    def match_resume_to_job(self, user_id, data):
        """
        Match a specific resume against a specific job description.

        Expected payload:
            resume_id (str): ID of the resume to match.
            job_id (str): ID of the job description to match against.

        Pipeline:
        1. Fetch resume and JD from the database.
        2. Run TF-IDF + Cosine Similarity via MatchingEngine.
        3. Compute weighted overall score (skills 50%, experience 30%, education 20%).
        4. Analyze skill gaps.
        5. Save and return the result.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        resume_id = data.get("resume_id")
        job_id = data.get("job_id")

        if not resume_id or not job_id:
            return {"error": "'resume_id' and 'job_id' are required."}, 400

        # ── Step 1: Fetch documents ──────────────────────────────────────
        resume = self.resume_model.find_by_id(resume_id)
        if not resume:
            return {"error": "Resume not found."}, 404

        job = self.job_model.find_by_id(job_id)
        if not job:
            return {"error": "Job description not found."}, 404

        resume_parsed = resume.get("parsed_data", {})
        job_parsed = job.get("parsed_data", {})

        # ── Step 2 & 3: Run matching engine ──────────────────────────────
        match_result = self.matching_engine.compute_match(
            resume_text=resume.get("raw_text", ""),
            job_text=job.get("description", ""),
            resume_skills=resume_parsed.get("skills", []),
            job_required_skills=job_parsed.get("required_skills", []),
            job_preferred_skills=job_parsed.get("preferred_skills", []),
            resume_experience=resume_parsed.get("experience", []),
            job_experience_level=job_parsed.get("experience_level", ""),
            resume_education=resume_parsed.get("education", []),
            job_education_level=job_parsed.get("education_level", ""),
        )

        # ── Step 4: Skill gap analysis ───────────────────────────────────
        skill_gap = self.skill_gap_analyzer.analyze(
            candidate_skills=resume_parsed.get("skills", []),
            required_skills=job_parsed.get("required_skills", []),
            preferred_skills=job_parsed.get("preferred_skills", []),
        )

        # ── Step 5: Persist match result ─────────────────────────────────
        match_doc = {
            "user_id": user_id,
            "resume_id": resume_id,
            "job_id": job_id,
            "overall_score": match_result["overall_score"],
            "skill_score": match_result["skill_score"],
            "experience_score": match_result["experience_score"],
            "education_score": match_result["education_score"],
            "tfidf_similarity": match_result["tfidf_similarity"],
            "matched_skills": match_result["matched_skills"],
            "missing_skills": match_result["missing_skills"],
            "skill_gap": skill_gap["skill_gap"],
            "recommendations": skill_gap["recommendations"],
        }
        match_id = self.match_model.save_match(match_doc)

        # ── Step 6: Return explainable result ────────────────────────────
        return {
            "message": "Matching completed successfully.",
            "match_id": match_id,
            "result": {
                "overall_score": match_result["overall_score"],
                "skill_score": match_result["skill_score"],
                "experience_score": match_result["experience_score"],
                "education_score": match_result["education_score"],
                "tfidf_similarity": match_result["tfidf_similarity"],
                "matched_skills": match_result["matched_skills"],
                "missing_skills": match_result["missing_skills"],
                "skill_gap": skill_gap["skill_gap"],
                "recommendations": skill_gap["recommendations"],
            },
        }, 200

    # ── History ──────────────────────────────────────────────────────────
    def get_match_history(self, user_id):
        """Return all past match results for a user."""
        matches = self.match_model.find_by_user(user_id)
        result = []
        for m in matches:
            result.append({
                "id": str(m["_id"]),
                "resume_id": m["resume_id"],
                "job_id": m["job_id"],
                "overall_score": m["overall_score"],
                "skill_score": m["skill_score"],
                "experience_score": m["experience_score"],
                "education_score": m["education_score"],
                "matched_skills": m.get("matched_skills", []),
                "missing_skills": m.get("missing_skills", []),
                "created_at": m["created_at"].isoformat(),
            })
        return {"matches": result}, 200

    def get_match_by_id(self, match_id):
        """Return a single match result with full detail."""
        m = self.match_model.find_by_id(match_id)
        if not m:
            return {"error": "Match result not found."}, 404

        return {
            "match": {
                "id": str(m["_id"]),
                "user_id": m["user_id"],
                "resume_id": m["resume_id"],
                "job_id": m["job_id"],
                "overall_score": m["overall_score"],
                "skill_score": m["skill_score"],
                "experience_score": m["experience_score"],
                "education_score": m["education_score"],
                "tfidf_similarity": m.get("tfidf_similarity", 0),
                "matched_skills": m.get("matched_skills", []),
                "missing_skills": m.get("missing_skills", []),
                "skill_gap": m.get("skill_gap", {}),
                "recommendations": m.get("recommendations", []),
                "created_at": m["created_at"].isoformat(),
            }
        }, 200

    def get_matches_for_job(self, job_id):
        """Return all candidate matches for a specific job (recruiter view)."""
        matches = self.match_model.find_by_job(job_id)
        result = []
        for m in matches:
            result.append({
                "id": str(m["_id"]),
                "user_id": m["user_id"],
                "resume_id": m["resume_id"],
                "overall_score": m["overall_score"],
                "matched_skills": m.get("matched_skills", []),
                "missing_skills": m.get("missing_skills", []),
                "created_at": m["created_at"].isoformat(),
            })
        return {"matches": result}, 200
