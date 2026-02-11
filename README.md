# AI-Based Resume & Job Description Matching System

An intelligent backend system that uses **NLP** and **Machine Learning** to match candidate resumes against job descriptions, providing explainable match scores and actionable skill-gap recommendations.

---

## Architecture

```
backend/
├── app.py                  # Flask application entry point
├── config.py               # Centralized configuration (env vars)
├── seed_demo_users.py      # Auto-seeds demo accounts on first run
├── requirements.txt        # Python dependencies
├── .env                    # Environment variables (local)
│
├── routes/                 # API endpoint definitions (Controller layer)
│   ├── auth_routes.py      # Authentication endpoints
│   ├── resume_routes.py    # Resume upload/management endpoints
│   ├── job_routes.py       # Job description endpoints
│   ├── match_routes.py     # Matching & skill-gap endpoints
│   └── admin_routes.py     # Admin dashboard endpoints
│
├── services/               # Business logic layer
│   ├── auth_service.py     # Login, register, profile logic
│   ├── resume_service.py   # Resume upload pipeline
│   ├── job_service.py      # JD creation & management
│   ├── match_service.py    # Matching orchestration
│   └── admin_service.py    # Admin statistics & logs
│
├── models/                 # Data access layer (MongoDB)
│   ├── user.py             # User CRUD operations
│   ├── resume.py           # Resume CRUD operations
│   ├── job.py              # Job description CRUD operations
│   └── match.py            # Match result CRUD operations
│
├── ml/                     # NLP & Machine Learning engine
│   ├── nlp_utils.py        # Text cleaning, tokenization, lemmatization
│   ├── resume_parser.py    # Resume NLP parsing
│   ├── jd_parser.py        # Job description NLP parsing
│   ├── matching_engine.py  # TF-IDF + Cosine Similarity scoring
│   └── skill_gap_analyzer.py  # Skill gap identification & recommendations
│
├── utils/                  # Shared utilities
│   ├── auth.py             # JWT generation, validation, decorators
│   ├── file_handler.py     # File upload, validation, text extraction
│   └── validators.py       # Input validation & sanitization
│
└── uploads/                # Uploaded resume files (auto-created)
```

---

## Tech Stack

| Component        | Technology                          |
|------------------|-------------------------------------|
| Language         | Python 3.10+                        |
| Web Framework    | Flask                               |
| Database         | MongoDB (via PyMongo)               |
| Authentication   | JWT (PyJWT) + bcrypt                |
| NLP              | spaCy + NLTK                        |
| Machine Learning | scikit-learn (TF-IDF + Cosine Sim)  |
| File Parsing     | PyPDF2 + python-docx               |

---

## Setup Instructions

### Prerequisites

- **Python 3.10+** installed
- **MongoDB** running locally on `mongodb://localhost:27017/` (or update `.env`)
- **pip** (Python package manager)

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Download spaCy Language Model

```bash
python -m spacy download en_core_web_sm
```

### Step 3: Configure Environment

Edit `backend/.env` with your settings (defaults work for local development):

```env
SECRET_KEY=super-secret-key-change-in-production
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=jdmatcher
JWT_SECRET_KEY=jwt-secret-key-change-in-production
```

### Step 4: Start the Server

```bash
python app.py
```

The server starts at **http://127.0.0.1:5000**.

Demo users are automatically created on first run.

---

## Demo Accounts

| Role      | Email               | Password       |
|-----------|---------------------|----------------|
| Candidate | candidate@demo.com  | Candidate@123  |
| Recruiter | recruiter@demo.com  | Recruiter@123  |
| Admin     | admin@demo.com      | Admin@123      |

---

## API Reference

### Authentication

| Method | Endpoint              | Description                | Auth |
|--------|-----------------------|----------------------------|------|
| POST   | `/api/auth/register`  | Register a new user        | No   |
| POST   | `/api/auth/login`     | Login and get JWT token    | No   |
| POST   | `/api/auth/logout`    | Logout (token discard)     | Yes  |
| GET    | `/api/auth/profile`   | Get current user profile   | Yes  |

### Resume Management

| Method | Endpoint                    | Description                  | Auth |
|--------|-----------------------------|------------------------------|------|
| POST   | `/api/resume/upload`        | Upload & parse resume        | Yes  |
| GET    | `/api/resume/list`          | List user's resumes          | Yes  |
| GET    | `/api/resume/latest`        | Get latest resume            | Yes  |
| GET    | `/api/resume/<resume_id>`   | Get specific resume          | Yes  |
| DELETE | `/api/resume/<resume_id>`   | Delete a resume              | Yes  |

### Job Descriptions

| Method | Endpoint                | Description                    | Auth      |
|--------|-------------------------|--------------------------------|-----------|
| POST   | `/api/job/create`       | Create a job description       | Recruiter |
| GET    | `/api/job/list`         | List recruiter's own jobs      | Yes       |
| GET    | `/api/job/all`          | List all jobs                  | Yes       |
| GET    | `/api/job/<job_id>`     | Get specific job               | Yes       |
| DELETE | `/api/job/<job_id>`     | Delete a job                   | Recruiter |

### Matching & Skill Gap

| Method | Endpoint                    | Description                    | Auth      |
|--------|-----------------------------|--------------------------------|-----------|
| POST   | `/api/match/analyze`        | Run resume–JD matching         | Yes       |
| GET    | `/api/match/history`        | Get user's match history       | Yes       |
| GET    | `/api/match/<match_id>`     | Get specific match result      | Yes       |
| GET    | `/api/match/job/<job_id>`   | Get all matches for a job      | Recruiter |
| POST   | `/api/match/skillgap`       | Standalone skill gap analysis  | Yes       |

### Admin Dashboard

| Method | Endpoint            | Description                | Auth  |
|--------|---------------------|----------------------------|-------|
| GET    | `/api/admin/stats`  | System-wide statistics     | Admin |
| GET    | `/api/admin/users`  | List all users             | Admin |
| GET    | `/api/admin/logs`   | Recent activity logs       | Admin |

### Utility

| Method | Endpoint        | Description      | Auth |
|--------|-----------------|------------------|------|
| GET    | `/api/health`   | Health check     | No   |

---

## Sample API Requests & Responses

### Login

**Request:**
```bash
curl -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "candidate@demo.com", "password": "Candidate@123"}'
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Candidate Demo",
    "email": "candidate@demo.com",
    "role": "Candidate"
  }
}
```

### Upload Resume

**Request:**
```bash
curl -X POST http://127.0.0.1:5000/api/resume/upload \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@resume.pdf"
```

**Response (201):**
```json
{
  "message": "Resume uploaded and parsed successfully.",
  "resume_id": "64f1a2b3c4d5e6f7a8b9c0d2",
  "parsed_data": {
    "skills": ["python", "django", "sql", "git", "rest"],
    "education": ["B.Tech in Computer Science"],
    "experience": ["Software Developer at TechCorp (2020-2023)"],
    "projects": ["E-commerce Platform using Django"]
  }
}
```

### Create Job Description

**Request:**
```bash
curl -X POST http://127.0.0.1:5000/api/job/create \
  -H "Authorization: Bearer <RECRUITER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Python Developer",
    "company": "TechCorp",
    "description": "Looking for a senior Python developer with 5+ years experience in Django, REST APIs, Docker, and AWS. Bachelor degree required. Nice to have: Kubernetes, CI/CD."
  }'
```

**Response (201):**
```json
{
  "message": "Job description created successfully.",
  "job_id": "64f1a2b3c4d5e6f7a8b9c0d3",
  "parsed_data": {
    "required_skills": ["python", "django", "rest", "docker", "aws"],
    "preferred_skills": ["kubernetes", "ci/cd"],
    "experience_level": "5+ years",
    "education_level": "Bachelor's Degree"
  }
}
```

### Run Matching

**Request:**
```bash
curl -X POST http://127.0.0.1:5000/api/match/analyze \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"resume_id": "64f...d2", "job_id": "64f...d3"}'
```

**Response (200):**
```json
{
  "message": "Matching completed successfully.",
  "match_id": "64f1a2b3c4d5e6f7a8b9c0d4",
  "result": {
    "overall_score": 68.5,
    "skill_score": 72.0,
    "experience_score": 60.0,
    "education_score": 100.0,
    "tfidf_similarity": 42.3,
    "matched_skills": ["python", "django", "rest", "sql"],
    "missing_skills": ["docker", "aws", "kubernetes", "ci/cd"],
    "skill_gap": {
      "technical": ["docker", "aws", "kubernetes", "ci/cd"],
      "soft": []
    },
    "recommendations": [
      "[HIGH] Docker: Containerize a sample app and learn Docker Compose.",
      "[HIGH] Aws: Study for the AWS Cloud Practitioner certification.",
      "[MEDIUM] Kubernetes: Complete the Kubernetes basics on Katacoda.",
      "[MEDIUM] Ci/Cd: Set up a CI/CD pipeline using GitHub Actions or Jenkins."
    ]
  }
}
```

---

## Matching Algorithm Explained

### 1. TF-IDF Vectorization
Converts resume and JD text into numerical vectors where each dimension represents a term's importance (Term Frequency × Inverse Document Frequency).

### 2. Cosine Similarity
Measures the cosine of the angle between the two TF-IDF vectors:
- **1.0** = identical content
- **0.0** = completely different

### 3. Weighted Scoring
| Component  | Weight | Method                              |
|------------|--------|-------------------------------------|
| Skills     | 50%    | Set intersection + TF-IDF blend     |
| Experience | 30%    | Year comparison + level matching     |
| Education  | 20%    | Hierarchical level comparison        |

### 4. Final Score
```
overall_score = (blended_skill × 0.50) + (experience × 0.30) + (education × 0.20)
```

Where `blended_skill = (direct_skill_match × 0.70) + (tfidf_similarity × 0.30)`

---

## Connecting to the Frontend

The frontend (imported from GitHub) should:
1. Set the API base URL to `http://127.0.0.1:5000/api`
2. Include `Authorization: Bearer <token>` header for protected routes
3. Use `Content-Type: application/json` for JSON payloads
4. Use `multipart/form-data` for file uploads

CORS is enabled for all origins by default. Update `CORS_ORIGINS` in `.env` for production.

---

## License

Academic project — for educational purposes.
