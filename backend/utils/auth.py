"""
utils/auth.py - JWT Authentication Utilities
----------------------------------------------
Provides helper functions for:
  - Generating JWT access tokens
  - Decoding / validating JWT tokens
  - A Flask decorator for protecting routes with role-based access control

Tokens carry: user_id, email, role, exp (expiration).
"""

import functools
from datetime import datetime, timedelta

import jwt
from flask import request, jsonify, g

from config import Config


def generate_token(user_id, email, role):
    """
    Create a signed JWT token containing the user's identity.

    Payload:
        user_id : str   – MongoDB document ID
        email   : str
        role    : str   – Candidate | Recruiter | Admin
        exp     : float – Expiration timestamp

    Returns:
        str: Encoded JWT token.
    """
    payload = {
        "user_id": str(user_id),
        "email": email,
        "role": role,
        "exp": datetime.utcnow()
            + timedelta(seconds=Config.JWT_ACCESS_TOKEN_EXPIRES),
    }
    token = jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm="HS256")
    return token


def decode_token(token):
    """
    Decode and validate a JWT token.

    Returns:
        dict | None: Decoded payload if valid, None if expired/invalid.
    """
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token has expired
    except jwt.InvalidTokenError:
        return None  # Token is malformed


def token_required(f):
    """
    Decorator that enforces JWT authentication on a route.

    How it works:
    1. Reads the Authorization header (expects "Bearer <token>").
    2. Decodes the token and stores user info in Flask's `g` object.
    3. Rejects the request with 401 if the token is missing or invalid.

    Usage:
        @app.route("/protected")
        @token_required
        def protected_route():
            user_id = g.user["user_id"]
            ...
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Extract token from Authorization header
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Authentication token is missing"}), 401

        # Decode and validate
        payload = decode_token(token)
        if payload is None:
            return jsonify({"error": "Token is invalid or expired"}), 401

        # Store decoded user info for the request lifecycle
        g.user = payload
        return f(*args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """
    Decorator that enforces role-based access control.

    Must be used AFTER @token_required so that g.user is populated.

    Usage:
        @app.route("/admin-only")
        @token_required
        @role_required("Admin")
        def admin_route():
            ...
    """
    def decorator(f):
        @functools.wraps(f)
        def decorated(*args, **kwargs):
            user_role = g.user.get("role", "")
            if user_role not in allowed_roles:
                return jsonify({"error": "Access denied. Insufficient permissions."}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator
