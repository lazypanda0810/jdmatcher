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

from flask import Blueprint, request, jsonify, g
from services.match_service import MatchService
from ml.skill_gap_analyzer import SkillGapAnalyzer
from ml.matching_engine import MatchingEngine
from ml.resume_parser import ResumeParser
from ml.jd_parser import JDParser
from models.resume import ResumeModel
from utils.auth import token_required, role_required
from utils.file_handler import save_uploaded_file, extract_text

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

    return match_bp
