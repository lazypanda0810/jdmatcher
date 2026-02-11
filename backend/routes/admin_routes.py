"""
routes/admin_routes.py - Admin API Endpoints
-----------------------------------------------
Exposes RESTful endpoints for admin dashboard functionality:

  GET /api/admin/stats      - System-wide statistics
  GET /api/admin/users      - List all registered users
  GET /api/admin/logs       - Recent matching activity logs

All routes are protected by JWT + Admin role check.
"""

from flask import Blueprint, request, jsonify
from services.admin_service import AdminService
from utils.auth import token_required, role_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def init_admin_routes(db):
    """
    Factory function to initialize admin routes with a database connection.

    Args:
        db: PyMongo database instance.

    Returns:
        Blueprint: Configured admin blueprint.
    """
    service = AdminService(db)

    # ── GET /api/admin/stats ─────────────────────────────────────────────
    @admin_bp.route("/stats", methods=["GET"])
    @token_required
    @role_required("Admin")
    def get_stats():
        """
        Get system-wide statistics for the admin dashboard.

        Requires: Admin role.

        Response (200):
            {
                "stats": {
                    "total_users": 42,
                    "total_resumes": 150,
                    "total_jobs": 35,
                    "total_matches": 280
                }
            }
        """
        try:
            response, status_code = service.get_stats()
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to get stats: {str(e)}"}), 500

    # ── GET /api/admin/users ─────────────────────────────────────────────
    @admin_bp.route("/users", methods=["GET"])
    @token_required
    @role_required("Admin")
    def get_all_users():
        """
        List all registered users in the system.

        Requires: Admin role.
        Passwords are excluded from the response.

        Response (200):
            {
                "users": [
                    {
                        "id": "64f...",
                        "name": "...",
                        "email": "...",
                        "role": "Candidate",
                        "created_at": "..."
                    }
                ]
            }
        """
        try:
            response, status_code = service.get_all_users()
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to get users: {str(e)}"}), 500

    # ── GET /api/admin/logs ──────────────────────────────────────────────
    @admin_bp.route("/logs", methods=["GET"])
    @token_required
    @role_required("Admin")
    def get_activity_logs():
        """
        Get recent matching activity logs.

        Query Parameters:
            limit (int, optional): Number of recent activities. Default=50.

        Requires: Admin role.

        Response (200):
            {
                "activities": [
                    {
                        "id": "...",
                        "user_id": "...",
                        "resume_id": "...",
                        "job_id": "...",
                        "overall_score": 72.5,
                        "created_at": "..."
                    }
                ]
            }
        """
        try:
            limit = request.args.get("limit", 50, type=int)
            response, status_code = service.get_activity_logs(limit=limit)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Failed to get logs: {str(e)}"}), 500

    return admin_bp
