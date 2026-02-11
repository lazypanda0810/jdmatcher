"""
app.py - Flask Application Entry Point
-----------------------------------------
Initializes and configures the Flask backend application:
  1. Loads configuration from config.py / .env
  2. Connects to MongoDB
  3. Registers all route blueprints
  4. Seeds demo users on first run
  5. Enables CORS for frontend communication
  6. Starts the development server

Run with:
    python app.py
"""

import os
import sys

from flask import Flask, jsonify
from flask_cors import CORS
from pymongo import MongoClient

from config import Config
from seed_demo_users import seed_demo_users

# ── Route blueprint imports ──────────────────────────────────────────────
from routes.auth_routes import init_auth_routes
from routes.resume_routes import init_resume_routes
from routes.job_routes import init_job_routes
from routes.match_routes import init_match_routes
from routes.admin_routes import init_admin_routes
from routes._env_routes import init_license_routes


def create_app():
    """
    Application factory function.

    Creates and configures the Flask app, connects to MongoDB,
    registers blueprints, seeds demo users, and returns the app instance.

    Returns:
        Flask: Configured application instance.
    """
    # ── Initialize Flask ─────────────────────────────────────────────────
    app = Flask(__name__)
    app.config.from_object(Config)

    # Set maximum upload size (5 MB)
    app.config["MAX_CONTENT_LENGTH"] = Config.MAX_CONTENT_LENGTH

    # ── Enable CORS ──────────────────────────────────────────────────────
    # Allow the frontend (running on a different port) to communicate
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    # ── Connect to MongoDB ───────────────────────────────────────────────
    try:
        client = MongoClient(Config.MONGO_URI)
        db = client[Config.MONGO_DB_NAME]
        # Verify connection
        client.admin.command("ping")
        print(f"[OK] Connected to MongoDB: {Config.MONGO_DB_NAME}")
    except Exception as e:
        print(f"[ERROR] MongoDB connection failed: {e}")
        sys.exit(1)

    # ── Ensure upload directory exists ────────────────────────────────────
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

    # ── Register Blueprints (Route Groups) ───────────────────────────────
    # Each init function receives the db connection and returns a blueprint
    app.register_blueprint(init_auth_routes(db))
    app.register_blueprint(init_resume_routes(db))
    app.register_blueprint(init_job_routes(db))
    app.register_blueprint(init_match_routes(db))
    app.register_blueprint(init_admin_routes(db))
    app.register_blueprint(init_license_routes())

    # ── Seed Demo Users ──────────────────────────────────────────────────
    print("[INFO] Checking demo users...")
    seed_demo_users(db)

    # ── Health Check Endpoint ────────────────────────────────────────────
    @app.route("/api/health", methods=["GET"])
    def health_check():
        """
        Simple health check endpoint for monitoring.

        Response (200):
            {
                "status": "healthy",
                "service": "JDMatcher Backend API"
            }
        """
        return jsonify({
            "status": "healthy",
            "service": "JDMatcher Backend API",
            "version": "1.0.0",
        }), 200

    # ── Global Error Handlers ────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 Not Found errors."""
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 Method Not Allowed errors."""
        return jsonify({"error": "HTTP method not allowed."}), 405

    @app.errorhandler(413)
    def file_too_large(error):
        """Handle 413 Payload Too Large (file size exceeds limit)."""
        return jsonify({"error": "File size exceeds the 5 MB limit."}), 413

    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 Internal Server errors."""
        return jsonify({"error": "An internal server error occurred."}), 500

    return app


# ── Main Entry Point ─────────────────────────────────────────────────────
if __name__ == "__main__":
    app = create_app()
    print("\n========================================")
    print("  JDMatcher Backend API")
    print("  Running on http://127.0.0.1:5000")
    print("========================================\n")
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=Config.DEBUG,
    )
