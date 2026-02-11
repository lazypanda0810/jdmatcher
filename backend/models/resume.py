"""
models/resume.py - Resume Data Model
--------------------------------------
Handles all database operations for resumes.

MongoDB Collection: resumes
Document Schema:
{
    _id           : ObjectId,
    user_id       : str  (reference to users._id),
    filename      : str,
    file_path     : str,
    raw_text      : str  (extracted text from PDF/DOCX),
    parsed_data   : {
        skills      : [str],
        education   : [str],
        experience  : [str],
        projects    : [str]
    },
    uploaded_at   : datetime,
    updated_at    : datetime
}
"""

from datetime import datetime
from bson import ObjectId


class ResumeModel:
    """Encapsulates all resume-related database operations."""

    def __init__(self, db):
        self.collection = db["resumes"]
        # Index on user_id for fast lookups
        self.collection.create_index("user_id")

    # ── Create ───────────────────────────────────────────────────────────
    def save_resume(self, user_id, filename, file_path, raw_text, parsed_data):
        """
        Store a parsed resume document.

        Args:
            user_id (str): Owner's user ID.
            filename (str): Original filename.
            file_path (str): Server-side storage path.
            raw_text (str): Extracted plain text.
            parsed_data (dict): Structured extraction (skills, education, etc.).

        Returns:
            str: Inserted document ID.
        """
        doc = {
            "user_id": user_id,
            "filename": filename,
            "file_path": file_path,
            "raw_text": raw_text,
            "parsed_data": parsed_data,
            "uploaded_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)

    # ── Read ─────────────────────────────────────────────────────────────
    def find_by_user(self, user_id):
        """Return all resumes belonging to a specific user."""
        return list(self.collection.find({"user_id": user_id}))

    def find_by_id(self, resume_id):
        """Return a single resume by its ID."""
        return self.collection.find_one({"_id": ObjectId(resume_id)})

    def get_latest_by_user(self, user_id):
        """Get the most recently uploaded resume for a user."""
        return self.collection.find_one(
            {"user_id": user_id},
            sort=[("uploaded_at", -1)],
        )

    def count_resumes(self):
        """Total number of resumes in the system."""
        return self.collection.count_documents({})

    # ── Update ───────────────────────────────────────────────────────────
    def update_parsed_data(self, resume_id, parsed_data):
        """Re-parse and update structured data for an existing resume."""
        self.collection.update_one(
            {"_id": ObjectId(resume_id)},
            {
                "$set": {
                    "parsed_data": parsed_data,
                    "updated_at": datetime.utcnow(),
                }
            },
        )

    # ── Delete ───────────────────────────────────────────────────────────
    def delete_resume(self, resume_id):
        """Remove a resume document by ID."""
        return self.collection.delete_one({"_id": ObjectId(resume_id)})
