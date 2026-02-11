"""
config.py - Application Configuration
--------------------------------------
Centralizes all configuration parameters using environment variables.
Supports .env file via python-dotenv for local development.
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class. All settings are read from environment variables
    with sensible defaults for local development."""

    # ── Flask Core Settings ──────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

    # ── MongoDB Settings ─────────────────────────────────────────────────
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "jdmatcher")

    # ── JWT Settings ─────────────────────────────────────────────────────
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret-key-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))  # 1 hour

    # ── File Upload Settings ─────────────────────────────────────────────
    UPLOAD_FOLDER = os.getenv(
        "UPLOAD_FOLDER",
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads"),
    )
    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 5 * 1024 * 1024))  # 5 MB
    ALLOWED_EXTENSIONS = {"pdf", "docx"}

    # ── CORS Settings ────────────────────────────────────────────────────
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")
