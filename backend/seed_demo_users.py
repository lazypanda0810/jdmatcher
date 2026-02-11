"""
seed_demo_users.py - Database Seeder
--------------------------------------
Creates the mandatory demo user accounts on first run.

Demo Users:
  1. candidate@demo.com  / Candidate@123  (Candidate)
  2. recruiter@demo.com  / Recruiter@123  (Recruiter)
  3. admin@demo.com      / Admin@123      (Admin)

Passwords are hashed with bcrypt before storage.
If a demo user already exists (by email), it is skipped.
"""

from models.user import UserModel


# Demo users to be seeded into the database
DEMO_USERS = [
    {
        "name": "Candidate Demo",
        "email": "candidate@demo.com",
        "password": "Candidate@123",
        "role": "Candidate",
    },
    {
        "name": "Recruiter Demo",
        "email": "recruiter@demo.com",
        "password": "Recruiter@123",
        "role": "Recruiter",
    },
    {
        "name": "Admin Demo",
        "email": "admin@demo.com",
        "password": "Admin@123",
        "role": "Admin",
    },
]


def seed_demo_users(db):
    """
    Insert demo users into the database if they don't already exist.

    This function is called automatically during application startup
    to ensure evaluation / demo accounts are always available.

    Args:
        db: PyMongo database instance.
    """
    user_model = UserModel(db)

    for user_data in DEMO_USERS:
        existing = user_model.find_by_email(user_data["email"])
        if existing:
            print(f"  [SKIP] Demo user '{user_data['email']}' already exists.")
        else:
            user_model.create_user(
                name=user_data["name"],
                email=user_data["email"],
                password=user_data["password"],
                role=user_data["role"],
            )
            print(f"  [CREATED] Demo user '{user_data['email']}' ({user_data['role']})")

    print("  Demo user seeding complete.")
