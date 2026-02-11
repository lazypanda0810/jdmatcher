"""
routes/job_routes.py - Job Description API Endpoints
-------------------------------------------------------
Exposes RESTful endpoints for job description management:

  POST   /api/job/create       - Create a new job description
  GET    /api/job/list         - List jobs for the authenticated recruiter
  GET    /api/job/all          - List all jobs (for candidates to browse)
  GET    /api/job/<job_id>     - Get a specific job by ID
  DELETE /api/job/<job_id>     - Delete a job (owner only)

Recruiter routes are protected by JWT + role checks.
"""

from flask import Blueprint, request, jsonify, g
from services.job_service import JobService
from utils.auth import token_required, role_required
from utils.file_handler import save_uploaded_file, extract_text

job_bp = Blueprint("job", __name__, url_prefix="/api/job")


def init_job_routes(db):
    """
    Factory function to initialize job routes with a database connection.

    Args:
        db: PyMongo database instance.

    Returns:
        Blueprint: Configured job blueprint.
    """
    service = JobService(db)

    # ── POST /api/job/create ─────────────────────────────────────────────
    @job_bp.route("/create", methods=["POST"])
    @token_required
    @role_required("Recruiter", "Admin")
    def create_job():
        """
        Create a new job description.

        Only Recruiters and Admins can create job descriptions.
        The raw JD text is parsed using NLP to extract required/preferred
        skills, experience level, and education level.

        Request Body (JSON):
            {
                "title": "Senior Python Developer",
                "company": "TechCorp",
                "description": "We are looking for a senior Python developer
                    with 5+ years of experience in Django, REST APIs..."
            }

        Response (201):
            {
                "message": "Job description created successfully.",
                "job_id": "64f...",
                "parsed_data": {
                    "required_skills": ["python", "django", "rest"],
                    "preferred_skills": ["docker", "aws"],
                    "experience_level": "5+ years",
                    "education_level": "Bachelor's Degree"
                }
            }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body must be JSON."}), 400

            user_id = g.user["user_id"]
            response, status_code = service.create_job(user_id, data)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to create job: {str(e)}"}), 500

    # ── POST /api/job/upload ──────────────────────────────────────────────
    @job_bp.route("/upload", methods=["POST"])
    @token_required
    @role_required("Recruiter", "Admin")
    def upload_job():
        """
        Upload a job description file (PDF or DOCX).

        The file is validated, text is extracted, and NLP parsing
        produces structured data (skills, experience, etc.).

        Request:
            Content-Type: multipart/form-data
            Fields:
                "file" - The JD file (PDF/DOCX)
                "title" - Job title (form field)
                "company" - Company name (optional form field)
        """
        try:
            if "file" not in request.files:
                return jsonify({"error": "No file provided. Use 'file' field."}), 400

            file = request.files["file"]
            title = request.form.get("title", "Untitled Job")
            company = request.form.get("company", "")
            user_id = g.user["user_id"]

            response, status_code = service.upload_job(user_id, file, title, company)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Upload failed: {str(e)}"}), 500

    # ── GET /api/job/list ────────────────────────────────────────────────
    @job_bp.route("/list", methods=["GET"])
    @token_required
    def list_my_jobs():
        """
        List all job descriptions created by the authenticated recruiter.

        Response (200):
            {
                "jobs": [
                    {
                        "id": "64f...",
                        "title": "...",
                        "company": "...",
                        "parsed_data": {...},
                        "created_at": "..."
                    }
                ]
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.get_user_jobs(user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to list jobs: {str(e)}"}), 500

    # ── GET /api/job/all ─────────────────────────────────────────────────
    @job_bp.route("/all", methods=["GET"])
    @token_required
    def list_all_jobs():
        """
        List all job descriptions in the system.
        Available to all authenticated users (candidates can browse).

        Response (200):
            {
                "jobs": [...]
            }
        """
        try:
            response, status_code = service.get_all_jobs()
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to list jobs: {str(e)}"}), 500

    # ── GET /api/job/<job_id> ────────────────────────────────────────────
    @job_bp.route("/<job_id>", methods=["GET"])
    @token_required
    def get_job(job_id):
        """
        Get a specific job description by its ID.

        Response (200):
            {
                "job": {
                    "id": "...",
                    "title": "...",
                    "company": "...",
                    "description": "...",
                    "parsed_data": {...},
                    "created_at": "..."
                }
            }
        """
        try:
            response, status_code = service.get_job_by_id(job_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to retrieve job: {str(e)}"}), 500

    # ── DELETE /api/job/<job_id> ─────────────────────────────────────────
    @job_bp.route("/<job_id>", methods=["DELETE"])
    @token_required
    @role_required("Recruiter", "Admin")
    def delete_job(job_id):
        """
        Delete a job description. Only the owner or Admin can delete.

        Response (200):
            {
                "message": "Job description deleted successfully."
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.delete_job(job_id, user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Delete failed: {str(e)}"}), 500

    return job_bp
