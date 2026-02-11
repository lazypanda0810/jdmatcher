"""
services/admin_service.py - Admin Business Logic
---------------------------------------------------
Provides aggregated data for the admin dashboard:
  - Total user count
  - Resume and JD counts
  - Recent matching activity logs
  - Full user listing
"""

from models.user import UserModel
from models.resume import ResumeModel
from models.job import JobModel
from models.match import MatchModel


class AdminService:
    """Business logic for admin-only endpoints."""

    def __init__(self, db):
        self.user_model = UserModel(db)
        self.resume_model = ResumeModel(db)
        self.job_model = JobModel(db)
        self.match_model = MatchModel(db)

    # ── Dashboard Stats ──────────────────────────────────────────────────
    def get_stats(self):
        """
        Aggregate system-wide statistics for the admin dashboard.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        stats = {
            "total_users": self.user_model.count_users(),
            "total_resumes": self.resume_model.count_resumes(),
            "total_jobs": self.job_model.count_jobs(),
            "total_matches": self.match_model.count_matches(),
        }
        return {"stats": stats}, 200

    # ── User Listing ─────────────────────────────────────────────────────
    def get_all_users(self):
        """
        Return all registered users (password excluded).

        Returns:
            tuple: (response_dict, http_status_code).
        """
        users = self.user_model.get_all_users()
        result = []
        for u in users:
            result.append({
                "id": str(u["_id"]),
                "name": u["name"],
                "email": u["email"],
                "role": u["role"],
                "created_at": u["created_at"].isoformat(),
            })
        return {"users": result}, 200

    # ── Activity Logs ────────────────────────────────────────────────────
    def get_activity_logs(self, limit=50):
        """
        Return recent matching activity logs for admin review.

        Each log entry includes the match score, IDs, and timestamp.

        Args:
            limit (int): Maximum number of recent activities.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        activities = self.match_model.get_recent_activity(limit=limit)
        result = []
        for a in activities:
            result.append({
                "id": str(a["_id"]),
                "user_id": a["user_id"],
                "resume_id": a["resume_id"],
                "job_id": a["job_id"],
                "overall_score": a["overall_score"],
                "created_at": a["created_at"].isoformat(),
            })
        return {"activities": result}, 200
