"""
models/user.py - User Data Model
---------------------------------
Handles all database operations related to users:
  - Creating new users (with bcrypt-hashed passwords)
  - Finding users by email or ID
  - Listing all users (admin)
  - Password verification

MongoDB Collection: users
Document Schema:
{
    _id        : ObjectId,
    name       : str,
    email      : str  (unique),
    password   : str  (bcrypt hash),
    role       : str  ("Candidate" | "Recruiter" | "Admin"),
    created_at : datetime
}
"""

from datetime import datetime
import bcrypt
from bson import ObjectId


class UserModel:
    """Encapsulates all user-related database operations."""

    def __init__(self, db):
        """
        Args:
            db: PyMongo database instance.
        """
        self.collection = db["users"]
        # Ensure email uniqueness at database level
        self.collection.create_index("email", unique=True)

    # ── Create ───────────────────────────────────────────────────────────
    def create_user(self, name, email, password, role="Candidate"):
        """
        Register a new user after hashing the password.

        Args:
            name (str): Full name.
            email (str): Email (must be unique).
            password (str): Plain-text password (will be hashed).
            role (str): One of Candidate | Recruiter | Admin.

        Returns:
            str: Inserted document's ID as string.
        """
        # Hash password with bcrypt; gensalt generates a random salt
        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        user_doc = {
            "name": name,
            "email": email.lower().strip(),
            "password": hashed_pw.decode("utf-8"),  # store as string
            "role": role,
            "created_at": datetime.utcnow(),
        }
        result = self.collection.insert_one(user_doc)
        return str(result.inserted_id)

    # ── Read ─────────────────────────────────────────────────────────────
    def find_by_email(self, email):
        """Look up a single user by email (case-insensitive)."""
        return self.collection.find_one({"email": email.lower().strip()})

    def find_by_id(self, user_id):
        """Look up a single user by MongoDB ObjectId."""
        return self.collection.find_one({"_id": ObjectId(user_id)})

    def get_all_users(self):
        """Return all users (admin route). Excludes password field."""
        return list(
            self.collection.find({}, {"password": 0})
        )

    def count_users(self):
        """Return total number of registered users."""
        return self.collection.count_documents({})

    # ── Verify ───────────────────────────────────────────────────────────
    @staticmethod
    def verify_password(plain_password, hashed_password):
        """
        Compare a plain-text password against a bcrypt hash.

        Args:
            plain_password (str): User-supplied password.
            hashed_password (str): Stored bcrypt hash.

        Returns:
            bool: True if passwords match.
        """
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
