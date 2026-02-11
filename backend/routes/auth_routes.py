"""
routes/auth_routes.py - Authentication API Endpoints
-------------------------------------------------------
Exposes RESTful endpoints for user authentication:

  POST /api/auth/register  - Register a new user
  POST /api/auth/login     - Login and get JWT token
  POST /api/auth/logout    - Logout (client-side token discard)
  GET  /api/auth/profile   - Get authenticated user's profile

All responses are JSON. Errors include meaningful HTTP status codes.
"""

from flask import Blueprint, request, jsonify, g
from services.auth_service import AuthService
from utils.auth import token_required

# Blueprint groups all auth-related routes under /api/auth
auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


def init_auth_routes(db):
    """
    Factory function to initialize auth routes with a database connection.

    Args:
        db: PyMongo database instance.

    Returns:
        Blueprint: Configured auth blueprint.
    """
    service = AuthService(db)

    # ── POST /api/auth/register ──────────────────────────────────────────
    @auth_bp.route("/register", methods=["POST"])
    def register():
        """
        Register a new user account.

        Request Body (JSON):
            {
                "name": "John Doe",
                "email": "john@example.com",
                "password": "StrongPass1",
                "role": "Candidate"          // optional, default=Candidate
            }

        Response (201):
            {
                "message": "Registration successful.",
                "user_id": "64f..."
            }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body must be JSON."}), 400

            response, status_code = service.register(data)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Registration failed: {str(e)}"}), 500

    # ── POST /api/auth/login ─────────────────────────────────────────────
    @auth_bp.route("/login", methods=["POST"])
    def login():
        """
        Authenticate a user and return a JWT token.

        Request Body (JSON):
            {
                "email": "candidate@demo.com",
                "password": "Candidate@123"
            }

        Response (200):
            {
                "message": "Login successful.",
                "token": "eyJ...",
                "user": {
                    "id": "64f...",
                    "name": "Candidate Demo",
                    "email": "candidate@demo.com",
                    "role": "Candidate"
                }
            }
        """
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "Request body must be JSON."}), 400

            response, status_code = service.login(data)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Login failed: {str(e)}"}), 500

    # ── POST /api/auth/logout ────────────────────────────────────────────
    @auth_bp.route("/logout", methods=["POST"])
    @token_required
    def logout():
        """
        Logout endpoint.

        Since JWT is stateless, actual token invalidation happens client-side
        by discarding the token. This endpoint confirms the logout action.

        Response (200):
            {
                "message": "Logout successful."
            }
        """
        # In a production system, you might maintain a token blacklist in Redis.
        # For this implementation, logout is handled client-side.
        return jsonify({"message": "Logout successful."}), 200

    # ── GET /api/auth/profile ────────────────────────────────────────────
    @auth_bp.route("/profile", methods=["GET"])
    @token_required
    def profile():
        """
        Get the authenticated user's profile information.

        Headers:
            Authorization: Bearer <JWT_TOKEN>

        Response (200):
            {
                "user": {
                    "id": "64f...",
                    "name": "...",
                    "email": "...",
                    "role": "...",
                    "created_at": "2025-01-01T00:00:00"
                }
            }
        """
        try:
            user_id = g.user["user_id"]
            response, status_code = service.get_profile(user_id)
            return jsonify(response), status_code

        except Exception as e:
            return jsonify({"error": f"Profile retrieval failed: {str(e)}"}), 500

    return auth_bp
