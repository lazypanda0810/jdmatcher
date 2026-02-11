"""
models/job.py - Job Description Data Model
--------------------------------------------
Handles database operations for job descriptions submitted by recruiters.

MongoDB Collection: jobs
Document Schema:
{
    _id              : ObjectId,
    user_id          : str  (recruiter who created it),
    title            : str,
    company          : str,
    description      : str  (raw JD text),
    parsed_data      : {
        required_skills  : [str],
        preferred_skills : [str],
        experience_level : str,
        education_level  : str
    },
    created_at       : datetime,
    updated_at       : datetime
}
"""

from datetime import datetime
from bson import ObjectId


class JobModel:
    """Encapsulates all job-description-related database operations."""

    def __init__(self, db):
        self.collection = db["jobs"]
        self.collection.create_index("user_id")

    # ── Create ───────────────────────────────────────────────────────────
    def create_job(self, user_id, title, company, description, parsed_data):
        """
        Save a new job description with its NLP-parsed structured data.

        Returns:
            str: Inserted document ID.
        """
        doc = {
            "user_id": user_id,
            "title": title,
            "company": company,
            "description": description,
            "parsed_data": parsed_data,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
        }
        result = self.collection.insert_one(doc)
        return str(result.inserted_id)

    # ── Read ─────────────────────────────────────────────────────────────
    def find_by_id(self, job_id):
        """Return a single job description by its ID."""
        return self.collection.find_one({"_id": ObjectId(job_id)})

    def find_by_user(self, user_id):
        """Return all job descriptions created by a specific recruiter."""
        return list(self.collection.find({"user_id": user_id}))

    def get_all_jobs(self):
        """Return all job descriptions (for admin or listing)."""
        return list(self.collection.find())

    def count_jobs(self):
        """Total number of job descriptions in the system."""
        return self.collection.count_documents({})

    # ── Update ───────────────────────────────────────────────────────────
    def update_job(self, job_id, update_fields):
        """Update specific fields of a job description."""
        update_fields["updated_at"] = datetime.utcnow()
        self.collection.update_one(
            {"_id": ObjectId(job_id)},
            {"$set": update_fields},
        )

    # ── Delete ───────────────────────────────────────────────────────────
    def delete_job(self, job_id):
        """Remove a job description by ID."""
        return self.collection.delete_one({"_id": ObjectId(job_id)})
