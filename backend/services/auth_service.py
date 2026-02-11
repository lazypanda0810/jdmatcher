"""
services/auth_service.py - Authentication Business Logic
----------------------------------------------------------
Orchestrates:
  - User registration (with validation)
  - User login (credential verification + JWT issuance)
  - Profile retrieval

This layer sits between routes and models, enforcing business rules.
"""

from models.user import UserModel
from utils.auth import generate_token
from utils.validators import (
    validate_email,
    validate_password,
    validate_required_fields,
    validate_role,
    sanitize_string,
)


class AuthService:
    """Business logic for authentication and user management."""

    def __init__(self, db):
        self.user_model = UserModel(db)

    # ── Register ─────────────────────────────────────────────────────────
    def register(self, data):
        """
        Register a new user after validating all inputs.

        Steps:
        1. Validate required fields (name, email, password).
        2. Validate email format.
        3. Validate password strength.
        4. Validate role if provided.
        5. Check for duplicate email.
        6. Create user in the database.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        # Step 1: Check required fields
        valid, msg = validate_required_fields(data, ["name", "email", "password"])
        if not valid:
            return {"error": msg}, 400

        name = sanitize_string(data["name"])
        email = sanitize_string(data["email"])
        password = data["password"]
        role = data.get("role", "Candidate")

        # Step 2: Validate email format
        valid, msg = validate_email(email)
        if not valid:
            return {"error": msg}, 400

        # Step 3: Validate password strength
        valid, msg = validate_password(password)
        if not valid:
            return {"error": msg}, 400

        # Step 4: Validate role
        valid, msg = validate_role(role)
        if not valid:
            return {"error": msg}, 400

        # Step 5: Check for existing user
        existing = self.user_model.find_by_email(email)
        if existing:
            return {"error": "A user with this email already exists."}, 409

        # Step 6: Create user
        user_id = self.user_model.create_user(name, email, password, role)

        return {
            "message": "Registration successful.",
            "user_id": user_id,
        }, 201

    # ── Login ────────────────────────────────────────────────────────────
    def login(self, data):
        """
        Authenticate a user and issue a JWT token.

        Steps:
        1. Validate required fields (email, password).
        2. Find user by email.
        3. Verify password against bcrypt hash.
        4. Generate and return JWT token.

        Returns:
            tuple: (response_dict, http_status_code).
        """
        valid, msg = validate_required_fields(data, ["email", "password"])
        if not valid:
            return {"error": msg}, 400

        email = sanitize_string(data["email"])
        password = data["password"]

        # Find user in database
        user = self.user_model.find_by_email(email)
        if not user:
            return {"error": "Invalid email or password."}, 401

        # Verify password
        if not UserModel.verify_password(password, user["password"]):
            return {"error": "Invalid email or password."}, 401

        # Generate JWT token
        token = generate_token(
            user_id=str(user["_id"]),
            email=user["email"],
            role=user["role"],
        )

        return {
            "message": "Login successful.",
            "token": token,
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
            },
        }, 200

    # ── Profile ──────────────────────────────────────────────────────────
    def get_profile(self, user_id):
        """
        Retrieve user profile by ID (excludes password).

        Returns:
            tuple: (response_dict, http_status_code).
        """
        user = self.user_model.find_by_id(user_id)
        if not user:
            return {"error": "User not found."}, 404

        return {
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"],
                "created_at": user["created_at"].isoformat(),
            }
        }, 200
