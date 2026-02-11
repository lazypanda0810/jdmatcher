"""
utils/validators.py - Input Validation Utilities
--------------------------------------------------
Provides reusable validation functions for:
  - Email format
  - Password strength
  - Required field checks
  - Role validation

All functions return (is_valid: bool, message: str).
"""

import re


def validate_email(email):
    """
    Validate email format using a regex pattern.

    Args:
        email (str): Email address to validate.

    Returns:
        tuple: (bool, str) – (True, "") or (False, error_message).
    """
    if not email:
        return False, "Email is required."

    # Standard email regex pattern
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    if not re.match(pattern, email.strip()):
        return False, "Invalid email format."

    return True, ""


def validate_password(password):
    """
    Validate password meets minimum strength requirements:
      - At least 6 characters
      - Contains at least one uppercase letter
      - Contains at least one digit

    Returns:
        tuple: (bool, str).
    """
    if not password:
        return False, "Password is required."
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit."
    return True, ""


def validate_required_fields(data, fields):
    """
    Check that all required fields are present and non-empty in a dict.

    Args:
        data (dict): Request payload.
        fields (list[str]): List of required field names.

    Returns:
        tuple: (bool, str).
    """
    for field in fields:
        value = data.get(field)
        if value is None or (isinstance(value, str) and value.strip() == ""):
            return False, f"'{field}' is required."
    return True, ""


def validate_role(role):
    """
    Ensure the provided role is one of the allowed values.

    Returns:
        tuple: (bool, str).
    """
    allowed_roles = {"Candidate", "Recruiter", "Admin"}
    if role not in allowed_roles:
        return False, f"Invalid role. Must be one of: {', '.join(allowed_roles)}."
    return True, ""


def sanitize_string(value):
    """
    Basic input sanitization: strip whitespace and remove HTML tags.

    Args:
        value (str): Raw input string.

    Returns:
        str: Sanitized string.
    """
    if not isinstance(value, str):
        return value
    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", value)
    return clean.strip()
