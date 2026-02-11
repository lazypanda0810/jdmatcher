"""
models/match.py - Match Result Data Model
-------------------------------------------
Stores the results of resume ↔ job description matching.

MongoDB Collection: matches
Document Schema:
{
    _id             : ObjectId,
    user_id         : str,
    resume_id       : str,
    job_id          : str,
    overall_score   : float  (0 – 100),
    skill_score     : float,
    experience_score: float,
    education_score : float,
    matched_skills  : [str],
    missing_skills  : [str],
    skill_gap       : {
        technical : [str],
        soft      : [str]
    },
    recommendations : [str],
    created_at      : datetime
}
"""

from datetime import datetime
from bson import ObjectId


class MatchModel:
    """Encapsulates all match-result database operations."""

    def __init__(self, db):
        self.collection = db["matches"]
        self.collection.create_index("user_id")
        self.collection.create_index("resume_id")
        self.collection.create_index("job_id")

    # ── Create ───────────────────────────────────────────────────────────
    def save_match(self, match_data):
        """
        Persist a match result document.

        Args:
            match_data (dict): Complete match result including scores,
                               skill overlaps, gaps, and recommendations.

        Returns:
            str: Inserted document ID.
        """
        match_data["created_at"] = datetime.utcnow()
        result = self.collection.insert_one(match_data)
        return str(result.inserted_id)

    # ── Read ─────────────────────────────────────────────────────────────
    def find_by_id(self, match_id):
        """Return a single match result by ID."""
        return self.collection.find_one({"_id": ObjectId(match_id)})

    def find_by_user(self, user_id):
        """Return all match results for a specific user, newest first."""
        return list(
            self.collection.find({"user_id": user_id}).sort("created_at", -1)
        )

    def find_by_job(self, job_id):
        """Return all match results for a specific job description."""
        return list(
            self.collection.find({"job_id": job_id}).sort("overall_score", -1)
        )

    def get_all_matches(self):
        """Return all match results (admin route)."""
        return list(self.collection.find().sort("created_at", -1))

    def count_matches(self):
        """Total number of match operations performed."""
        return self.collection.count_documents({})

    def get_recent_activity(self, limit=20):
        """Return the most recent match activities for admin dashboard."""
        return list(
            self.collection.find()
            .sort("created_at", -1)
            .limit(limit)
        )
