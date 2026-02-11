"""
ml/nlp_utils.py - Shared NLP Preprocessing Utilities
-------------------------------------------------------
Provides common NLP operations used across the ML pipeline:
  - Text cleaning (remove URLs, emails, special chars)
  - Tokenization
  - Stop-word removal
  - Lemmatization

Uses:
  - spaCy (en_core_web_sm model) for tokenization and lemmatization
  - NLTK for stop-word lists

All functions are stateless and reusable.
"""

import re
import spacy
import nltk
from nltk.corpus import stopwords

# ── One-time downloads & model loads ─────────────────────────────────────
# Download NLTK stop-words if not already present
nltk.download("stopwords", quiet=True)
nltk.download("punkt", quiet=True)

# Load spaCy English model (small, fast, good for tokenization + lemma)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    # If model not installed, download it programmatically
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# NLTK English stop-words set
STOP_WORDS = set(stopwords.words("english"))


# ── Text Cleaning ────────────────────────────────────────────────────────
def clean_text(text):
    """
    Remove noise from raw text:
      - URLs
      - Email addresses
      - Special characters and digits (except hyphens in compound words)
      - Excessive whitespace

    Args:
        text (str): Raw input text.

    Returns:
        str: Cleaned text.
    """
    if not text:
        return ""

    # Remove URLs
    text = re.sub(r"http\S+|www\.\S+", "", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+\.\S+", "", text)
    # Remove special characters but keep letters, spaces, and hyphens
    text = re.sub(r"[^a-zA-Z\s\-]", " ", text)
    # Collapse multiple spaces
    text = re.sub(r"\s+", " ", text)

    return text.strip().lower()


# ── Tokenization + Lemmatization ─────────────────────────────────────────
def preprocess_text(text):
    """
    Full NLP preprocessing pipeline:
      1. Clean the raw text.
      2. Tokenize using spaCy.
      3. Remove stop-words.
      4. Lemmatize each token.

    Args:
        text (str): Raw text to preprocess.

    Returns:
        list[str]: List of lemmatized, meaningful tokens.
    """
    cleaned = clean_text(text)
    doc = nlp(cleaned)

    tokens = []
    for token in doc:
        # Skip stop-words, punctuation, and very short tokens
        if (
            token.text not in STOP_WORDS
            and not token.is_punct
            and not token.is_space
            and len(token.text) > 1
        ):
            tokens.append(token.lemma_)

    return tokens


def get_preprocessed_string(text):
    """
    Return preprocessed text as a single space-joined string.
    Useful for TF-IDF vectorization which expects string input.

    Args:
        text (str): Raw text.

    Returns:
        str: Preprocessed string.
    """
    tokens = preprocess_text(text)
    return " ".join(tokens)


# ── Skill Extraction Helpers ─────────────────────────────────────────────
# Comprehensive skill keyword lists for matching
TECHNICAL_SKILLS = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "ruby", "go",
    "rust", "kotlin", "swift", "php", "scala", "r", "matlab", "perl",
    "objective-c", "dart", "lua", "haskell", "elixir", "clojure",

    # Web Frameworks
    "react", "angular", "vue", "django", "flask", "spring", "express",
    "node", "nodejs", "next", "nextjs", "nuxt", "svelte", "fastapi",
    "rails", "laravel", "asp.net", "bootstrap", "tailwind", "jquery",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "cassandra", "dynamodb", "firebase", "sqlite", "oracle", "neo4j",
    "mariadb", "couchdb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "terraform",
    "ansible", "ci/cd", "linux", "git", "github", "gitlab", "bitbucket",
    "nginx", "apache", "heroku", "vercel", "netlify", "cloudflare",

    # Data Science & ML
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn", "nlp",
    "computer vision", "opencv", "spacy", "nltk", "transformers",
    "data analysis", "data science", "statistics", "hadoop", "spark",
    "tableau", "power bi", "jupyter",

    # Mobile
    "android", "ios", "react native", "flutter", "xamarin",

    # Other
    "rest", "api", "graphql", "microservices", "agile", "scrum",
    "html", "css", "sass", "less", "webpack", "babel", "testing",
    "unit testing", "selenium", "cypress", "jest", "mocha",
    "figma", "photoshop", "illustrator", "ui/ux",
    "blockchain", "solidity", "web3",
}

SOFT_SKILLS = {
    "communication", "leadership", "teamwork", "problem solving",
    "problem-solving", "critical thinking", "time management",
    "adaptability", "creativity", "collaboration", "decision making",
    "conflict resolution", "negotiation", "presentation",
    "analytical", "detail oriented", "detail-oriented",
    "self motivated", "self-motivated", "multitasking",
    "organizational", "interpersonal", "mentoring",
    "project management", "strategic thinking",
}


def extract_skills_from_text(text):
    """
    Extract technical and soft skills from text using keyword matching.

    Uses a curated skill dictionary and checks for multi-word skill phrases.

    Args:
        text (str): Raw text to search for skills.

    Returns:
        list[str]: Unique skills found in the text.
    """
    text_lower = text.lower()
    found_skills = set()

    # Check for multi-word skills first (e.g., "machine learning")
    all_skills = TECHNICAL_SKILLS | SOFT_SKILLS
    for skill in all_skills:
        if skill in text_lower:
            found_skills.add(skill)

    return list(found_skills)


def categorize_skill(skill):
    """
    Determine whether a skill is technical or soft.

    Args:
        skill (str): Skill name.

    Returns:
        str: "technical" or "soft".
    """
    if skill.lower() in TECHNICAL_SKILLS:
        return "technical"
    elif skill.lower() in SOFT_SKILLS:
        return "soft"
    return "technical"  # Default to technical for unknown skills
