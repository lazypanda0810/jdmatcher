"""
ml/jd_parser.py - Job Description NLP Parser
-----------------------------------------------
Extracts structured data from raw job description text:
  - Required skills
  - Preferred skills
  - Experience level
  - Education level

Uses:
  - Keyword matching against curated skill dictionaries
  - spaCy NLP for entity recognition
  - Regex patterns for experience/education requirements
"""

import re
from ml.nlp_utils import extract_skills_from_text, nlp


class JDParser:
    """
    NLP-based job description parser.

    Splits JD text into logical sections and extracts:
    required skills, preferred skills, experience level, and education.
    """

    def parse(self, description_text):
        """
        Main parsing entry point.

        Args:
            description_text (str): Raw job description text.

        Returns:
            dict: {
                "required_skills": [...],
                "preferred_skills": [...],
                "experience_level": str,
                "education_level": str
            }
        """
        # Extract all skills found in the JD
        all_skills = extract_skills_from_text(description_text)

        # Classify skills as required vs. preferred based on context
        required_skills, preferred_skills = self._classify_skills(
            description_text, all_skills
        )

        # Extract experience level requirement
        experience_level = self._extract_experience_level(description_text)

        # Extract education level requirement
        education_level = self._extract_education_level(description_text)

        return {
            "required_skills": required_skills,
            "preferred_skills": preferred_skills,
            "experience_level": experience_level,
            "education_level": education_level,
        }

    def _classify_skills(self, text, all_skills):
        """
        Classify extracted skills as required or preferred.

        Strategy:
        - If a skill appears near words like "required", "must have",
          "mandatory" → required.
        - If near "preferred", "nice to have", "bonus", "plus" → preferred.
        - Default to required if no context clues are found.

        Args:
            text (str): Full JD text.
            all_skills (list): Skills found in the text.

        Returns:
            tuple: (required_skills, preferred_skills) as lists.
        """
        text_lower = text.lower()
        required = []
        preferred = []

        # Patterns indicating "preferred" context
        preferred_patterns = [
            r"(?i)(preferred|nice to have|desirable|bonus|plus|advantag|optional)"
        ]

        # Check if the text has a clear "preferred" section
        has_preferred_section = any(
            re.search(p, text_lower) for p in preferred_patterns
        )

        if has_preferred_section:
            # Split text at "preferred" / "nice to have" boundary
            split_pattern = r"(?i)(preferred|nice to have|desirable|bonus|additional)"
            parts = re.split(split_pattern, text_lower, maxsplit=1)
            required_section = parts[0] if parts else text_lower
            preferred_section = parts[-1] if len(parts) > 1 else ""

            for skill in all_skills:
                if skill.lower() in preferred_section:
                    preferred.append(skill)
                else:
                    required.append(skill)
        else:
            # No clear section — treat all as required
            required = all_skills

        # Ensure no duplicates
        required = list(set(required))
        preferred = list(set(preferred) - set(required))

        return required, preferred

    def _extract_experience_level(self, text):
        """
        Extract the experience level requirement from JD text.

        Looks for patterns like:
        - "3+ years of experience"
        - "5-7 years experience"
        - "entry level", "senior", "mid-level"

        Returns:
            str: Experience level description.
        """
        text_lower = text.lower()

        # Pattern: "X+ years" or "X-Y years"
        year_patterns = [
            r"(\d+)\s*\+?\s*years?\s*(?:of)?\s*(?:experience|exp)",
            r"(\d+)\s*-\s*(\d+)\s*years?\s*(?:of)?\s*(?:experience|exp)",
            r"(?:minimum|at least|min)\s*(\d+)\s*years?",
        ]

        for pattern in year_patterns:
            match = re.search(pattern, text_lower)
            if match:
                groups = match.groups()
                if len(groups) == 2 and groups[1]:
                    return f"{groups[0]}-{groups[1]} years"
                return f"{groups[0]}+ years"

        # Level-based patterns
        level_patterns = {
            "entry level": r"(?i)(entry.level|fresher|graduate|junior|0.1\s*year)",
            "mid level": r"(?i)(mid.level|intermediate|2.5\s*years?)",
            "senior level": r"(?i)(senior|lead|principal|6\+?\s*years?|7\+?\s*years?|8\+?\s*years?)",
        }

        for level, pattern in level_patterns.items():
            if re.search(pattern, text_lower):
                return level

        return "Not specified"

    def _extract_education_level(self, text):
        """
        Extract education level requirements from JD text.

        Returns:
            str: Education requirement description.
        """
        text_lower = text.lower()

        education_levels = [
            (r"(?i)(ph\.?\s*d|doctorate)", "PhD / Doctorate"),
            (r"(?i)(master|m\.?\s*s\.?|m\.?\s*tech|m\.?\s*e\.?|mba)", "Master's Degree"),
            (r"(?i)(bachelor|b\.?\s*s\.?|b\.?\s*tech|b\.?\s*e\.?|b\.?\s*sc|undergraduate)", "Bachelor's Degree"),
            (r"(?i)(diploma|associate)", "Diploma / Associate"),
            (r"(?i)(high school|secondary)", "High School"),
        ]

        for pattern, label in education_levels:
            if re.search(pattern, text_lower):
                return label

        return "Not specified"
