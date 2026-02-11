"""
services/resume_service.py - Resume Business Logic
-----------------------------------------------------
Orchestrates the full resume upload pipeline:
  1. File validation & storage
  2. Text extraction (PDF / DOCX)
  3. NLP-based parsing (delegates to ml.resume_parser)
  4. Persistence to MongoDB

Also provides retrieval methods for parsed resume data.
"""

from models.resume import ResumeModel
from utils.file_handler import save_uploaded_file, extract_text
from ml.resume_parser import ResumeParser


class ResumeService:
    """Business logic for resume upload, parsing, and retrieval."""

    def __init__(self, db):
        self.resume_model = ResumeModel(db)
        self.parser = ResumeParser()

    # ── Upload & Parse ───────────────────────────────────────────────────
    def upload_resume(self, user_id, file_storage):
        """
        Complete resume upload pipeline.

        Steps:
        1. Validate and save file to disk.
        2. Extract raw text from the file.
        3. Run NLP parser to extract structured data.
        4. Store everything in MongoDB.

        Args:
            user_id (str): Authenticated user's ID.
            file_storage: Flask FileStorage object.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        # Step 1: Save file securely
        filepath, original_filename = save_uploaded_file(file_storage)
        if not filepath:
            return {
                "error": "Invalid file. Only PDF and DOCX files up to 5 MB are allowed."
            }, 400

        # Step 2: Extract text from the uploaded document
        raw_text = extract_text(filepath)
        if not raw_text.strip():
            return {
                "error": "Could not extract text from the uploaded file. "
                         "Please ensure the file is not empty or image-based."
            }, 400

        # Step 3: Parse structured data using NLP
        parsed_data = self.parser.parse(raw_text)

        # Step 4: Store in MongoDB
        resume_id = self.resume_model.save_resume(
            user_id=user_id,
            filename=original_filename,
            file_path=filepath,
            raw_text=raw_text,
            parsed_data=parsed_data,
        )

        return {
            "message": "Resume uploaded and parsed successfully.",
            "resume_id": resume_id,
            "parsed_data": parsed_data,
        }, 201

    # ── Retrieve ─────────────────────────────────────────────────────────
    def get_user_resumes(self, user_id):
        """
        Get all resumes belonging to a user.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        resumes = self.resume_model.find_by_user(user_id)
        result = []
        for r in resumes:
            result.append({
                "id": str(r["_id"]),
                "filename": r["filename"],
                "parsed_data": r["parsed_data"],
                "uploaded_at": r["uploaded_at"].isoformat(),
            })
        return {"resumes": result}, 200

    def get_resume_by_id(self, resume_id, user_id=None):
        """
        Get a specific resume. Optionally verify ownership.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        resume = self.resume_model.find_by_id(resume_id)
        if not resume:
            return {"error": "Resume not found."}, 404

        # If user_id is provided, confirm ownership
        if user_id and resume["user_id"] != user_id:
            return {"error": "Access denied."}, 403

        return {
            "resume": {
                "id": str(resume["_id"]),
                "filename": resume["filename"],
                "raw_text": resume["raw_text"],
                "parsed_data": resume["parsed_data"],
                "uploaded_at": resume["uploaded_at"].isoformat(),
            }
        }, 200

    def get_latest_resume(self, user_id):
        """
        Get the most recently uploaded resume for a user.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        resume = self.resume_model.get_latest_by_user(user_id)
        if not resume:
            return {"error": "No resume found. Please upload a resume first."}, 404

        return {
            "resume": {
                "id": str(resume["_id"]),
                "filename": resume["filename"],
                "parsed_data": resume["parsed_data"],
                "uploaded_at": resume["uploaded_at"].isoformat(),
            }
        }, 200

    def delete_resume(self, resume_id, user_id):
        """
        Delete a resume after verifying ownership.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        resume = self.resume_model.find_by_id(resume_id)
        if not resume:
            return {"error": "Resume not found."}, 404
        if resume["user_id"] != user_id:
            return {"error": "Access denied."}, 403

        self.resume_model.delete_resume(resume_id)
        return {"message": "Resume deleted successfully."}, 200
