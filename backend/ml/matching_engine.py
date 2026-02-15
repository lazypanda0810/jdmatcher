"""
ml/matching_engine.py - AI Matching Engine
--------------------------------------------
Core matching algorithm that computes how well a resume matches a job description.

Approach:
  1. TF-IDF Vectorization: Convert resume and JD text into numerical vectors
     using Term Frequency–Inverse Document Frequency.
  2. Cosine Similarity: Measure the angle between the two TF-IDF vectors
     to determine overall textual similarity.
  3. Component Scoring: Independently score skills, experience, and education.
  4. Weighted Aggregation: Combine component scores into a final score:
     - Skills:     50% weight
     - Experience: 30% weight
     - Education:  20% weight

Libraries:
  - scikit-learn: TfidfVectorizer, cosine_similarity
  - NLP utils: text preprocessing
"""

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from ml.nlp_utils import get_preprocessed_string
from ml.ai_engine import AIEngine
from ml.ml_model import MatchPredictor


class MatchingEngine:
    """
    Computes an explainable match score between a resume and a job description.

    Combines three scoring approaches:
      - NLP: TF-IDF vectorization + cosine similarity
      - AI:  Deep learning transformer embeddings (semantic similarity)
      - ML:  Trained GradientBoosting predictor (learned from match data)
    """

    # Component scoring weights (must sum to 1.0)
    SKILL_WEIGHT = 0.50
    EXPERIENCE_WEIGHT = 0.30
    EDUCATION_WEIGHT = 0.20

    # AI/ML blending weights for final score
    RULE_BASED_WEIGHT = 0.60  # NLP + heuristic scoring
    AI_WEIGHT = 0.20          # Transformer semantic scoring
    ML_WEIGHT = 0.20          # Trained ML model scoring

    def __init__(self):
        """Initialize AI and ML engines alongside NLP pipeline."""
        self.ai_engine = AIEngine()
        self.ml_predictor = MatchPredictor()

    def compute_match(
        self,
        resume_text,
        job_text,
        resume_skills,
        job_required_skills,
        job_preferred_skills,
        resume_experience,
        job_experience_level,
        resume_education,
        job_education_level,
    ):
        """
        Full matching pipeline.

        Args:
            resume_text (str):         Raw resume text.
            job_text (str):            Raw JD text.
            resume_skills (list):      Skills extracted from resume.
            job_required_skills (list):Required skills from JD.
            job_preferred_skills (list):Preferred skills from JD.
            resume_experience (list):  Experience entries from resume.
            job_experience_level (str):Required experience level.
            resume_education (list):   Education entries from resume.
            job_education_level (str): Required education level.

        Returns:
            dict: {
                overall_score, skill_score, experience_score,
                education_score, tfidf_similarity,
                matched_skills, missing_skills
            }
        """
        # ── Step 1: TF-IDF Cosine Similarity (NLP) ────────────────────
        tfidf_sim = self._compute_tfidf_similarity(resume_text, job_text)

        # ── Step 2: AI Semantic Similarity (Deep Learning) ───────────
        semantic_sim = self.ai_engine.compute_semantic_similarity(
            resume_text, job_text
        )

        # ── Step 3: Skill Score ──────────────────────────────────────────
        skill_score, matched_skills, missing_skills = self._compute_skill_score(
            resume_skills, job_required_skills, job_preferred_skills
        )

        # ── Step 4: Experience Score ─────────────────────────────────────
        experience_score = self._compute_experience_score(
            resume_experience, job_experience_level
        )

        # ── Step 5: Education Score ──────────────────────────────────────
        education_score = self._compute_education_score(
            resume_education, job_education_level
        )

        # ── Step 6: ML Prediction (Trained Model) ───────────────────────
        ml_features = self.ml_predictor.extract_features(
            tfidf_sim=tfidf_sim,
            semantic_sim=semantic_sim,
            skill_score=skill_score,
            experience_score=experience_score,
            education_score=education_score,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            required_skills=job_required_skills,
            preferred_skills=job_preferred_skills,
        )
        ml_predicted_score = self.ml_predictor.predict_score(ml_features)
        ml_quality = self.ml_predictor.predict_quality(ml_features)

        # ── Step 7: Blended Overall Score (NLP + AI + ML) ────────────
        # Rule-based score from NLP heuristics
        blended_skill = (skill_score * 0.7) + (tfidf_sim * 100 * 0.3)
        rule_based_score = (
            blended_skill * self.SKILL_WEIGHT
            + experience_score * self.EXPERIENCE_WEIGHT
            + education_score * self.EDUCATION_WEIGHT
        )

        # AI-enhanced score using transformer semantic similarity
        ai_score = (
            (skill_score * 0.5 + semantic_sim * 100 * 0.5) * self.SKILL_WEIGHT
            + experience_score * self.EXPERIENCE_WEIGHT
            + education_score * self.EDUCATION_WEIGHT
        )

        # Final blended score
        if ml_predicted_score is not None:
            # Full AI + ML pipeline
            overall_score = (
                rule_based_score * self.RULE_BASED_WEIGHT
                + ai_score * self.AI_WEIGHT
                + ml_predicted_score * self.ML_WEIGHT
            )
        else:
            # No trained ML model yet — use AI + NLP only
            overall_score = (
                rule_based_score * 0.65
                + ai_score * 0.35
            )

        # Clamp to 0-100 range
        overall_score = round(min(max(overall_score, 0), 100), 2)

        return {
            "overall_score": overall_score,
            "skill_score": round(skill_score, 2),
            "experience_score": round(experience_score, 2),
            "education_score": round(education_score, 2),
            "tfidf_similarity": round(tfidf_sim * 100, 2),
            "semantic_similarity": round(semantic_sim * 100, 2),
            "ml_predicted_score": ml_predicted_score,
            "ml_quality": ml_quality,
            "rule_based_score": round(rule_based_score, 2),
            "ai_enhanced_score": round(ai_score, 2),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
        }

    # ── TF-IDF + Cosine Similarity ───────────────────────────────────────
    def _compute_tfidf_similarity(self, text_a, text_b):
        """
        Compute cosine similarity between two documents using TF-IDF vectors.

        How it works:
        1. Preprocess both texts (clean, tokenize, lemmatize).
        2. Fit a TF-IDF vectorizer on both documents.
        3. Compute cosine similarity between the resulting vectors.

        Cosine similarity measures the cosine of the angle between two vectors:
        - 1.0 = identical direction (perfect match)
        - 0.0 = orthogonal (no similarity)

        Returns:
            float: Cosine similarity score between 0 and 1.
        """
        # Preprocess both texts
        processed_a = get_preprocessed_string(text_a)
        processed_b = get_preprocessed_string(text_b)

        if not processed_a.strip() or not processed_b.strip():
            return 0.0

        # Create TF-IDF vectors
        # TfidfVectorizer converts text into a matrix of TF-IDF features
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([processed_a, processed_b])

        # Compute cosine similarity between the two document vectors
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

        return float(similarity[0][0])

    # ── Skill Scoring ────────────────────────────────────────────────────
    def _compute_skill_score(
        self, resume_skills, required_skills, preferred_skills
    ):
        """
        Score how well the candidate's skills match the job requirements.

        Algorithm:
        - Required skill match:  80% of skill score
        - Preferred skill match: 20% of skill score

        Returns:
            tuple: (score, matched_skills, missing_skills)
        """
        # Normalize all skills to lowercase for comparison
        resume_set = {s.lower() for s in resume_skills}
        required_set = {s.lower() for s in required_skills}
        preferred_set = {s.lower() for s in preferred_skills}

        # Find overlaps
        matched_required = resume_set & required_set
        matched_preferred = resume_set & preferred_set
        missing_required = required_set - resume_set
        missing_preferred = preferred_set - resume_set

        # Calculate required skill match percentage
        if required_set:
            required_pct = len(matched_required) / len(required_set) * 100
        else:
            required_pct = 100  # No requirements means full match

        # Calculate preferred skill match percentage
        if preferred_set:
            preferred_pct = len(matched_preferred) / len(preferred_set) * 100
        else:
            preferred_pct = 100

        # Weighted skill score (required = 80%, preferred = 20%)
        skill_score = (required_pct * 0.8) + (preferred_pct * 0.2)

        matched_skills = sorted(list(matched_required | matched_preferred))
        missing_skills = sorted(list(missing_required | missing_preferred))

        return skill_score, matched_skills, missing_skills

    # ── Experience Scoring ───────────────────────────────────────────────
    def _compute_experience_score(self, resume_experience, job_experience_level):
        """
        Score based on experience level alignment.

        Strategy:
        - Extract years of experience from resume text.
        - Extract required years from JD experience level.
        - Compare: if candidate meets or exceeds → high score.

        Returns:
            float: Experience score (0-100).
        """
        if (
            not job_experience_level
            or job_experience_level == "Not specified"
        ):
            return 75.0  # Neutral score when no requirement stated

        # Extract numeric years from the job requirement
        required_years = self._extract_years(job_experience_level)

        # Extract years from resume experience entries
        resume_years = 0
        for entry in resume_experience:
            extracted = self._extract_years(entry)
            if extracted > resume_years:
                resume_years = extracted

        # If we haven't found explicit years, estimate from number of entries
        if resume_years == 0 and resume_experience:
            valid_entries = [
                e for e in resume_experience if e != "Not specified"
            ]
            resume_years = len(valid_entries) * 1.5  # rough estimate

        # Score calculation
        if required_years == 0:
            return 75.0

        ratio = resume_years / required_years
        if ratio >= 1.0:
            return 100.0  # Meets or exceeds requirement
        elif ratio >= 0.75:
            return 80.0
        elif ratio >= 0.5:
            return 60.0
        elif ratio >= 0.25:
            return 40.0
        else:
            return 20.0

    # ── Education Scoring ────────────────────────────────────────────────
    def _compute_education_score(self, resume_education, job_education_level):
        """
        Score based on education level alignment.

        Uses a hierarchy of education levels and checks if the candidate
        meets the minimum requirement.

        Returns:
            float: Education score (0-100).
        """
        if (
            not job_education_level
            or job_education_level == "Not specified"
        ):
            return 75.0  # Neutral when no requirement

        # Education level hierarchy (higher index = higher qualification)
        hierarchy = {
            "high school": 1,
            "diploma": 2,
            "associate": 2,
            "bachelor": 3,
            "master": 4,
            "phd": 5,
            "doctorate": 5,
        }

        # Determine required level
        required_level = 0
        for key, level in hierarchy.items():
            if key in job_education_level.lower():
                required_level = level
                break

        # Determine candidate's highest education level
        candidate_level = 0
        for entry in resume_education:
            entry_lower = entry.lower()
            for key, level in hierarchy.items():
                if key in entry_lower and level > candidate_level:
                    candidate_level = level

        # Score based on comparison
        if required_level == 0:
            return 75.0

        if candidate_level >= required_level:
            return 100.0  # Meets or exceeds
        elif candidate_level == required_level - 1:
            return 70.0  # One level below
        elif candidate_level > 0:
            return 40.0  # Has some education but below requirement
        else:
            return 20.0  # No education info found

    # ── Utility ──────────────────────────────────────────────────────────
    @staticmethod
    def _extract_years(text):
        """
        Extract a numeric year count from text.

        Matches patterns like "5+ years", "3-5 years", "3 years", etc.

        Returns:
            float: Number of years found, or 0.
        """
        patterns = [
            r"(\d+)\s*\+\s*years?",
            r"(\d+)\s*-\s*(\d+)\s*years?",
            r"(\d+)\s*years?",
        ]
        for pattern in patterns:
            match = re.search(pattern, str(text).lower())
            if match:
                groups = match.groups()
                if len(groups) == 2 and groups[1]:
                    # Range: take the midpoint
                    return (float(groups[0]) + float(groups[1])) / 2
                return float(groups[0])
        return 0
