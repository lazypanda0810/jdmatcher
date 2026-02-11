"""
routes/resume_routes.py - Resume API Endpoints
-------------------------------------------------
Exposes RESTful endpoints for resume management:

  POST   /api/resume/upload       - Upload and parse a resume (PDF/DOCX)
  GET    /api/resume/list         - List all resumes for the current user
  GET    /api/resume/latest       - Get the latest resume for the current user
  GET    /api/resume/<resume_id>  - Get a specific resume by ID
  DELETE /api/resume/<resume_id>  - Delete a specific resume

Protected by JWT authentication – only the owning user can access their resumes.
"""

from flask import Blueprint, request, jsonify, g
from services.resume_service import ResumeService
from utils.auth import token_required

resume_bp = Blueprint("resume", __name__, url_prefix="/api/resume")


def init_resume_routes(db):
    """
    Factory function to initialize resume routes with a database connection.

    Args:
        db: PyMongo database instance.

    Returns:
        Blueprint: Configured resume blueprint.
    """
    service = ResumeService(db)

    # ── POST /api/resume/upload ──────────────────────────────────────────
    @resume_bp.route("/upload", methods=["POST"])
    @token_required
    def upload_resume():
        """
        Upload a resume file (PDF or DOCX).

        The file is validated, stored on disk, text is extracted,
        and NLP parsing produces structured data (skills, education, etc.).

        Request:
            Content-Type: multipart/form-data
            Field: "file" (the resume file)

        Headers:
            Authorization: Bearer <JWT_TOKEN>

        Response (201):
            {
                "message": "Resume uploaded and parsed successfully.",
                "resume_id": "64f...",
                "parsed_data": {
                    "skills": ["python", "react", ...],
                    "education": ["B.Tech Computer Science"],
                    "experience": ["Software Developer at XYZ"],
                    "projects": ["E-commerce Platform"]
                }
            }
        """
        try:
            # Validate that a file is present in the request
            if "file" not in request.files:
                return jsonify({"error": "No file provided. Use 'file' field."}), 400

            file = request.files["file"]
            user_id = g.user["user_id"]

            response, status_code = service.upload_resume(user_id, file)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Upload failed: {str(e)}"}), 500

    # ── GET /api/resume/list ─────────────────────────────────────────────
    @resume_bp.route("/list", methods=["GET"])
    @token_required
    def list_resumes():
        """
        List all resumes uploaded by the authenticated user.

        Response (200):
            {
                "resumes": [
                    {
                        "id": "64f...",
                        "filename": "resume.pdf",
                        "parsed_data": {...},
                        "uploaded_at": "2025-01-01T00:00:00"
                    }
                ]
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.get_user_resumes(user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to list resumes: {str(e)}"}), 500

    # ── GET /api/resume/latest ───────────────────────────────────────────
    @resume_bp.route("/latest", methods=["GET"])
    @token_required
    def latest_resume():
        """
        Get the most recently uploaded resume for the authenticated user.

        Response (200):
            {
                "resume": {
                    "id": "64f...",
                    "filename": "resume.pdf",
                    "parsed_data": {...},
                    "uploaded_at": "2025-01-01T00:00:00"
                }
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.get_latest_resume(user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to retrieve resume: {str(e)}"}), 500

    # ── GET /api/resume/<resume_id> ──────────────────────────────────────
    @resume_bp.route("/<resume_id>", methods=["GET"])
    @token_required
    def get_resume(resume_id):
        """
        Get a specific resume by its ID.
        Verifies ownership before returning data.

        Response (200):
            {
                "resume": {
                    "id": "...",
                    "filename": "...",
                    "raw_text": "...",
                    "parsed_data": {...},
                    "uploaded_at": "..."
                }
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.get_resume_by_id(resume_id, user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to retrieve resume: {str(e)}"}), 500

    # ── DELETE /api/resume/<resume_id> ───────────────────────────────────
    @resume_bp.route("/<resume_id>", methods=["DELETE"])
    @token_required
    def delete_resume(resume_id):
        """
        Delete a resume by ID. Verifies ownership first.

        Response (200):
            {
                "message": "Resume deleted successfully."
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.delete_resume(resume_id, user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Delete failed: {str(e)}"}), 500

    return resume_bp
