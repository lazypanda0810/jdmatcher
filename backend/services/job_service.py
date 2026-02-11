"""
services/job_service.py - Job Description Business Logic
----------------------------------------------------------
Orchestrates:
  - Accepting raw JD text from the frontend
  - Running NLP extraction (skills, experience level, etc.)
  - Storing structured JD data in MongoDB
  - CRUD operations for job descriptions
"""

from models.job import JobModel
from ml.jd_parser import JDParser
from utils.validators import validate_required_fields, sanitize_string
from utils.file_handler import save_uploaded_file, extract_text


class JobService:
    """Business logic for job description management."""

    def __init__(self, db):
        self.job_model = JobModel(db)
        self.jd_parser = JDParser()

    # ── Create ───────────────────────────────────────────────────────────
    def create_job(self, user_id, data):
        """
        Create a new job description.

        Steps:
        1. Validate required fields (title, company, description).
        2. Run NLP parser on the description text.
        3. Store structured result in MongoDB.

        Args:
            user_id (str): Recruiter's user ID.
            data (dict): Request payload with title, company, description.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        # Validate required fields
        valid, msg = validate_required_fields(data, ["title", "description"])
        if not valid:
            return {"error": msg}, 400

        title = sanitize_string(data["title"])
        company = sanitize_string(data.get("company", ""))
        description = sanitize_string(data["description"])

        # Run NLP extraction on the job description text
        parsed_data = self.jd_parser.parse(description)

        # Persist to database
        job_id = self.job_model.create_job(
            user_id=user_id,
            title=title,
            company=company,
            description=description,
            parsed_data=parsed_data,
        )

        return {
            "message": "Job description created successfully.",
            "job_id": job_id,
            "parsed_data": parsed_data,
        }, 201

    # ── Upload & Parse ────────────────────────────────────────────────────
    def upload_job(self, user_id, file_storage, title, company):
        """
        Upload a JD file, extract text, parse with NLP, and store.

        Args:
            user_id (str): Recruiter's user ID.
            file_storage: Flask FileStorage object.
            title (str): Job title.
            company (str): Company name.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        # Save file securely
        filepath, original_filename = save_uploaded_file(file_storage)
        if not filepath:
            return {
                "error": "Invalid file. Only PDF and DOCX files up to 5 MB are allowed."
            }, 400

        # Extract text from the uploaded document
        raw_text = extract_text(filepath)
        if not raw_text.strip():
            return {
                "error": "Could not extract text from the uploaded file. "
                         "Please ensure the file is not empty or image-based."
            }, 400

        title = sanitize_string(title) if title else "Untitled Job"
        company = sanitize_string(company) if company else ""

        # Run NLP extraction on the job description text
        parsed_data = self.jd_parser.parse(raw_text)

        # Persist to database
        job_id = self.job_model.create_job(
            user_id=user_id,
            title=title,
            company=company,
            description=raw_text,
            parsed_data=parsed_data,
        )

        return {
            "message": "Job description uploaded and parsed successfully.",
            "job_id": job_id,
            "parsed_data": parsed_data,
            "filename": original_filename,
        }, 201

    # ── Read ─────────────────────────────────────────────────────────────
    def get_user_jobs(self, user_id):
        """Return all job descriptions created by a recruiter."""
        jobs = self.job_model.find_by_user(user_id)
        result = []
        for j in jobs:
            result.append({
                "id": str(j["_id"]),
                "title": j["title"],
                "company": j["company"],
                "parsed_data": j["parsed_data"],
                "created_at": j["created_at"].isoformat(),
            })
        return {"jobs": result}, 200

    def get_job_by_id(self, job_id):
        """Return a single job description with full details."""
        job = self.job_model.find_by_id(job_id)
        if not job:
            return {"error": "Job description not found."}, 404

        return {
            "job": {
                "id": str(job["_id"]),
                "title": job["title"],
                "company": job["company"],
                "description": job["description"],
                "parsed_data": job["parsed_data"],
                "created_at": job["created_at"].isoformat(),
            }
        }, 200

    def get_all_jobs(self):
        """Return all job descriptions (for listing or admin)."""
        jobs = self.job_model.get_all_jobs()
        result = []
        for j in jobs:
            result.append({
                "id": str(j["_id"]),
                "title": j["title"],
                "company": j["company"],
                "description": j.get("description", ""),
                "parsed_data": j["parsed_data"],
                "user_id": j["user_id"],
                "created_at": j["created_at"].isoformat(),
            })
        return {"jobs": result}, 200

    # ── Delete ───────────────────────────────────────────────────────────
    def delete_job(self, job_id, user_id):
        """Delete a job description after verifying ownership."""
        job = self.job_model.find_by_id(job_id)
        if not job:
            return {"error": "Job description not found."}, 404
        if job["user_id"] != user_id:
            return {"error": "Access denied."}, 403

        self.job_model.delete_job(job_id)
        return {"message": "Job description deleted successfully."}, 200
