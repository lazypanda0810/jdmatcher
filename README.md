# JDMatcher — AI Resume & Job Description Matching System

An intelligent full-stack app that uses **Machine Learning** to match resumes against job descriptions.  
Upload a resume + a JD → get a match score, skill gap analysis, and recommendations.

---

## What's Inside This Folder

```
jdmatcher/
│
├── backend/          ← Python Flask API server (the brain)
│   ├── app.py        ← Main file that starts the server
│   ├── ml/           ← Machine learning matching code
│   ├── routes/       ← API endpoints
│   ├── models/       ← Database models
│   ├── services/     ← Business logic
│   └── requirements.txt  ← List of Python packages needed
│
├── frontend/         ← React website (the face)
│   ├── src/          ← All the React code
│   ├── package.json  ← List of JavaScript packages needed
│   └── vite.config.ts
│
└── README.md         ← This file (you are here)
```

---

## Tech Stack

| What              | Technology                           |
|-------------------|--------------------------------------|
| Backend Language  | Python 3.10+                         |
| Backend Framework | Flask                                |
| Frontend          | React + TypeScript + Tailwind CSS    |
| Build Tool        | Vite                                 |
| Database          | MongoDB                              |
| ML Engine         | scikit-learn (TF-IDF + Cosine Sim)   |
| NLP               | spaCy + NLTK                         |
| Auth              | JWT + bcrypt                         |
| File Parsing      | PyPDF2 + python-docx                 |

---

# HOW TO RUN THIS PROJECT (Step by Step)

> **Read EVERY step. Don't skip anything. Follow the EXACT order.**

---

## BEFORE YOU START — Install These 3 Things

You need **3 programs** installed on your computer. If you already have them, skip to Step 1.

### Install Python (version 3.10 or higher)

1. Go to https://www.python.org/downloads/
2. Click the big yellow **"Download Python 3.x.x"** button
3. Run the installer
4. **IMPORTANT: Check the box that says "Add Python to PATH"** at the bottom of the installer. If you miss this, nothing will work.
5. Click "Install Now"
6. To verify it worked, open **Command Prompt** or **PowerShell** and type:
   ```
   python --version
   ```
   You should see something like `Python 3.13.5`. If you see an error, Python is not installed correctly.

### Install Node.js (version 18 or higher)

1. Go to https://nodejs.org/
2. Download the **LTS** version (the green button)
3. Run the installer, click Next through everything
4. To verify it worked, open a **new** terminal and type:
   ```
   node --version
   ```
   You should see something like `v20.x.x` or `v22.x.x`.
5. Also check npm (comes with Node.js):
   ```
   npm --version
   ```

### Install MongoDB

1. Go to https://www.mongodb.com/try/download/community
2. Select your OS (Windows/Mac/Linux), download the **.msi** installer
3. Run the installer
4. **Choose "Complete" installation**
5. **Keep "Install MongoDB as a Service" checked** — this makes MongoDB start automatically
6. Optionally install MongoDB Compass (a GUI to see your data — recommended)
7. To verify it worked, open a terminal and type:
   ```
   mongod --version
   ```
   You should see a version number. If you get an error, MongoDB didn't install correctly.

> **On Windows:** MongoDB usually installs as a Windows Service and starts automatically. You can check by searching for "Services" in the Start menu, scrolling down to "MongoDB Server", and making sure it says "Running".

---

## STEP 1 — Download the Code

### Option A: Clone with Git (if you have Git installed)

```bash
git clone https://github.com/lazypanda0810/jdmatcher.git
```

### Option B: Download as ZIP (if you don't have Git)

1. Go to https://github.com/lazypanda0810/jdmatcher
2. Click the green **"Code"** button
3. Click **"Download ZIP"**
4. Extract/unzip the folder somewhere on your computer (e.g., Desktop)

You should now have a folder called `jdmatcher` with `backend/` and `frontend/` folders inside it.

---

## STEP 2 — Start the Backend (Python Server)

Open a terminal (Command Prompt, PowerShell, or VS Code terminal).

### 2a. Go into the backend folder

```bash
cd jdmatcher/backend
```

> If you extracted the ZIP to your Desktop, the full path might be:
> ```
> cd C:\Users\YourName\Desktop\jdmatcher\backend
> ```

### 2b. Create a virtual environment

This creates an isolated Python environment so packages don't mess up your system.

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

> After activation, you should see `(venv)` at the beginning of your terminal line. That means it's working. If you don't see `(venv)`, the activation didn't work — try again.

### 2c. Install Python packages

```bash
pip install -r requirements.txt
```

This will download and install about 15-20 packages. Wait for it to finish. It might take 2-5 minutes.

> If you see red error text about "Microsoft Visual C++ Build Tools", you need to install them:
> Go to https://visualstudio.microsoft.com/visual-cpp-build-tools/
> Download and install, then try `pip install -r requirements.txt` again.

### 2d. Download the English language model for spaCy

```bash
python -m spacy download en_core_web_sm
```

This downloads a ~12MB language model that the ML engine uses to understand text.

### 2e. Start the backend server

```bash
python app.py
```

You should see output like this:

```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

**Leave this terminal open and running. Don't close it.**  
The backend is now running at **http://127.0.0.1:5000**.

> If you see `Connection refused` or `ServerSelectionTimeoutError`, it means **MongoDB is not running**. Go back and make sure MongoDB is installed and the service is started.

---

## STEP 3 — Start the Frontend (React Website)

**Open a SECOND terminal** (don't close the first one — the backend needs to keep running).

### 3a. Go into the frontend folder

```bash
cd jdmatcher/frontend
```

### 3b. Install JavaScript packages

```bash
npm install
```

This downloads all the React/UI packages. It will take 1-3 minutes. You'll see a progress bar.

> If you see `npm WARN` messages, that's fine. Warnings are okay. Only worry about `npm ERR!` messages.

### 3c. Start the frontend

```bash
npm run dev
```

You should see output like this:

```
  VITE v5.4.21  ready in 500ms

  ➜  Local:   http://localhost:8080/
  ➜  Network: http://192.168.x.x:8080/
```

**Leave this terminal open too.**

---

## STEP 4 — Open the App in Your Browser

Open your web browser (Chrome, Edge, Firefox — any is fine) and go to:

```
http://localhost:8080
```

You should see the JDMatcher landing page. That's it — you're running!

---

## STEP 5 — Login and Use the App

The app comes with 3 demo accounts pre-loaded. You don't need to register.

| Role        | Email                | Password        | What It Does                              |
|-------------|----------------------|-----------------|-------------------------------------------|
| **Candidate** | `candidate@demo.com` | `Candidate@123` | Upload YOUR resume, match against a JD    |
| **Recruiter** | `recruiter@demo.com` | `Recruiter@123` | Upload multiple resumes, rank candidates  |
| **Admin**     | `admin@demo.com`     | `Admin@123`     | View system statistics                    |

### How to test matching:

1. Login as **Candidate** or **Recruiter**
2. Upload a **Resume** file (PDF or DOCX)
3. Upload a **Job Description** file (PDF or DOCX) — OR — write/paste the JD text in the text box
4. Click **Analyze Match**
5. See your match score, matched skills, missing skills, and recommendations

---

## Quick Summary (Cheat Sheet)

Once everything is installed, you only need to run these commands every time:

**Terminal 1 — Backend:**
```bash
cd jdmatcher/backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
python app.py
```

**Terminal 2 — Frontend:**
```bash
cd jdmatcher/frontend
npm run dev
```

**Browser:**
```
http://localhost:8080
```

---

## Troubleshooting — If Something Goes Wrong

| Problem | Fix |
|---------|-----|
| `python is not recognized` | Python is not installed, or you didn't check "Add to PATH" during install. Reinstall Python and check that box. |
| `node is not recognized` | Node.js is not installed. Download it from https://nodejs.org/ |
| `npm ERR! code ENOENT` | You're in the wrong folder. Make sure you `cd` into the `frontend/` folder first. |
| `pip is not recognized` | Python is not in your PATH. Reinstall Python with "Add to PATH" checked. |
| `ModuleNotFoundError: No module named 'flask'` | You forgot to activate the virtual environment, or forgot to run `pip install -r requirements.txt`. |
| `(venv) doesn't appear` in terminal | Virtual environment is not activated. Run `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux). |
| `ServerSelectionTimeoutError` or `Connection refused` on backend start | MongoDB is not running. Open Windows Services and start "MongoDB Server", or install MongoDB. |
| Backend starts but frontend shows `Network Error` | The backend is not running on port 5000. Make sure the first terminal is still showing Flask running. |
| White/blank page on `localhost:8080` | Try a hard refresh: `Ctrl+Shift+R`. If still blank, check the terminal running `npm run dev` for errors. |
| `EACCES permission denied` (Mac/Linux) | Use `sudo` before the command, e.g. `sudo npm install`. |
| Port 5000 already in use | Another program is using port 5000. Close it, or change the port in `backend/app.py`. |
| Port 8080 already in use | Change the port in `frontend/vite.config.ts` (look for `port: 8080`). |

---

## Folder Structure (Detailed)

```
jdmatcher/
│
├── backend/
│   ├── app.py                    # Flask entry point — starts the server
│   ├── config.py                 # Reads settings from .env file
│   ├── seed_demo_users.py        # Creates the 3 demo accounts on first run
│   ├── requirements.txt          # All Python packages needed
│   │
│   ├── routes/                   # API endpoints (URLs the frontend talks to)
│   │   ├── auth_routes.py        # Login, register, logout
│   │   ├── resume_routes.py      # Upload/manage resumes
│   │   ├── job_routes.py         # Create/manage job descriptions
│   │   ├── match_routes.py       # Run ML matching + skill gap
│   │   └── admin_routes.py       # Admin stats
│   │
│   ├── services/                 # Business logic (the "how")
│   │   ├── auth_service.py
│   │   ├── resume_service.py
│   │   ├── job_service.py
│   │   ├── match_service.py
│   │   └── admin_service.py
│   │
│   ├── models/                   # Database read/write operations
│   │   ├── user.py
│   │   ├── resume.py
│   │   ├── job.py
│   │   └── match.py
│   │
│   ├── ml/                       # Machine Learning engine
│   │   ├── nlp_utils.py          # Text cleaning & tokenization
│   │   ├── resume_parser.py      # Extracts skills/education/experience from resume
│   │   ├── jd_parser.py          # Extracts requirements from job description
│   │   ├── matching_engine.py    # TF-IDF + Cosine Similarity scoring
│   │   └── skill_gap_analyzer.py # Finds missing skills & generates recommendations
│   │
│   ├── utils/                    # Helper utilities
│   │   ├── auth.py               # JWT token generation & validation
│   │   ├── file_handler.py       # File upload handling & text extraction
│   │   └── validators.py         # Input validation
│   │
│   └── uploads/                  # Where uploaded files are stored
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx               # Root React component
│   │   ├── main.tsx              # App entry point
│   │   ├── pages/
│   │   │   ├── Auth.tsx          # Login/register page
│   │   │   ├── Landing.tsx       # Home page
│   │   │   ├── CandidateDashboard.tsx  # Candidate's match analysis view
│   │   │   ├── RecruiterDashboard.tsx  # Recruiter's candidate ranking view
│   │   │   └── AdminPanel.tsx    # Admin statistics view
│   │   ├── services/
│   │   │   └── api.ts            # All API calls to the backend
│   │   └── components/           # Reusable UI components
│   │
│   ├── package.json              # JavaScript dependencies
│   └── vite.config.ts            # Vite dev server config (port 8080)
│
└── README.md                     # This file
```

---

## How the ML Matching Works

When you upload a resume and a JD, here's what happens behind the scenes:

1. **Text Extraction** — PyPDF2/python-docx reads the text from your PDF/DOCX files
2. **NLP Parsing** — spaCy + NLTK extract skills, education, experience from both documents
3. **TF-IDF Vectorization** — Converts both texts into number vectors based on word importance
4. **Cosine Similarity** — Measures how similar the two vectors are (0% = totally different, 100% = identical)
5. **Weighted Score Calculation:**

| Component  | Weight | What It Checks                        |
|------------|--------|---------------------------------------|
| Skills     | 50%    | How many required skills you have     |
| Experience | 30%    | Years of experience match             |
| Education  | 20%    | Education level match                 |

6. **Skill Gap Analysis** — Lists skills you're missing + gives learning recommendations

---

## API Endpoints (For Developers)

### Auth
| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | `/api/auth/register`  | Register new user       |
| POST   | `/api/auth/login`     | Login, get JWT token    |
| POST   | `/api/auth/logout`    | Logout                  |
| GET    | `/api/auth/profile`   | Get current user        |

### Resume
| Method | Endpoint                   | Description            |
|--------|----------------------------|------------------------|
| POST   | `/api/resume/upload`       | Upload & parse resume  |
| GET    | `/api/resume/list`         | List user's resumes    |
| GET    | `/api/resume/latest`       | Get latest resume      |
| DELETE | `/api/resume/<resume_id>`  | Delete a resume        |

### Job Descriptions
| Method | Endpoint             | Description              |
|--------|----------------------|--------------------------|
| POST   | `/api/job/create`    | Create a JD              |
| POST   | `/api/job/upload`    | Upload JD file           |
| GET    | `/api/job/list`      | List recruiter's jobs    |
| GET    | `/api/job/all`       | List all jobs            |

### Matching
| Method | Endpoint                   | Description                    |
|--------|----------------------------|--------------------------------|
| POST   | `/api/match/direct`        | Upload resume + JD, get match  |
| POST   | `/api/match/analyze`       | Match by resume_id + job_id    |
| GET    | `/api/match/history`       | Match history                  |
| POST   | `/api/match/skillgap`      | Skill gap analysis             |

### Admin
| Method | Endpoint           | Description        |
|--------|--------------------|--------------------|
| GET    | `/api/admin/stats` | System statistics  |
| GET    | `/api/admin/users` | List all users     |

### Health
| Method | Endpoint       | Description  |
|--------|----------------|--------------|
| GET    | `/api/health`  | Health check |

---

## License

Developed by **RAJ KISHOR** — For demo and educational purposes.
