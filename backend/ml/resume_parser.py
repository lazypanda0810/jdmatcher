"""
ml/resume_parser.py - Resume NLP Parser
-----------------------------------------
Extracts structured data from raw resume text:
  - Skills (technical + soft)
  - Education history
  - Work experience
  - Projects

Uses:
  - spaCy for named entity recognition and section detection
  - Custom keyword lists for skill extraction
  - Regex patterns for section identification
"""

import re
from ml.nlp_utils import extract_skills_from_text, nlp


class ResumeParser:
    """
    NLP-based resume parser.

    Extracts structured information from unstructured resume text
    by identifying section headers and applying entity extraction.
    """

    # Common section header patterns (case-insensitive)
    SECTION_PATTERNS = {
        "education": r"(?i)\b(education|academic|qualification|degree|university|college)\b",
        "experience": r"(?i)\b(experience|employment|work history|professional|career)\b",
        "projects": r"(?i)\b(project|personal project|academic project|portfolio)\b",
        "skills": r"(?i)\b(skill|technical skill|competenc|expertise|proficiency|technology)\b",
    }

    def parse(self, raw_text):
        """
        Main parsing method. Extracts all structured sections.

        Args:
            raw_text (str): Full resume text extracted from PDF/DOCX.

        Returns:
            dict: {
                "skills": [...],
                "education": [...],
                "experience": [...],
                "projects": [...]
            }
        """
        # Extract skills using keyword matcher
        skills = extract_skills_from_text(raw_text)

        # Split text into sections and extract relevant content
        sections = self._split_into_sections(raw_text)

        education = self._extract_education(
            sections.get("education", ""), raw_text
        )
        experience = self._extract_experience(
            sections.get("experience", ""), raw_text
        )
        projects = self._extract_projects(sections.get("projects", ""))

        return {
            "skills": skills,
            "education": education,
            "experience": experience,
            "projects": projects,
        }

    def _split_into_sections(self, text):
        """
        Split resume text into logical sections based on header patterns.

        Strategy:
        - Find all section header positions in the text.
        - Extract text between consecutive headers.

        Returns:
            dict: Section name → section text content.
        """
        lines = text.split("\n")
        sections = {}
        current_section = None
        current_content = []

        for line in lines:
            matched = False
            for section_name, pattern in self.SECTION_PATTERNS.items():
                if re.search(pattern, line):
                    # Save the previous section
                    if current_section:
                        sections[current_section] = "\n".join(current_content)
                    current_section = section_name
                    current_content = []
                    matched = True
                    break

            if not matched and current_section:
                current_content.append(line)

        # Save the last section
        if current_section:
            sections[current_section] = "\n".join(current_content)

        return sections

    def _extract_education(self, section_text, full_text):
        """
        Extract education entries from the education section.

        Looks for:
        - Degree names (B.Tech, M.Sc, MBA, etc.)
        - University/college names
        - Year patterns

        Returns:
            list[str]: Education entries.
        """
        education = []
        text = section_text if section_text else full_text

        # Common degree patterns
        degree_patterns = [
            r"(?i)(b\.?\s*tech|b\.?\s*e\.?|bachelor)",
            r"(?i)(m\.?\s*tech|m\.?\s*e\.?|master|m\.?\s*s\.?|m\.?\s*sc)",
            r"(?i)(ph\.?\s*d|doctorate)",
            r"(?i)(mba|m\.?\s*b\.?\s*a)",
            r"(?i)(b\.?\s*sc|b\.?\s*com|b\.?\s*a\.?)",
            r"(?i)(diploma|certification|certificate)",
            r"(?i)(high school|secondary|hsc|ssc|12th|10th)",
        ]

        lines = text.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue
            for pattern in degree_patterns:
                if re.search(pattern, line):
                    education.append(line)
                    break

        # Deduplicate while preserving order
        seen = set()
        unique_edu = []
        for e in education:
            normalized = e.lower().strip()
            if normalized not in seen:
                seen.add(normalized)
                unique_edu.append(e.strip())

        return unique_edu if unique_edu else ["Not specified"]

    def _extract_experience(self, section_text, full_text):
        """
        Extract work experience entries.

        Looks for:
        - Job titles (developer, engineer, analyst, etc.)
        - Date ranges (Jan 2020 – Dec 2022)
        - Company-like lines

        Returns:
            list[str]: Experience entries.
        """
        experience = []
        text = section_text if section_text else full_text

        # Job title patterns
        job_patterns = [
            r"(?i)(developer|engineer|analyst|manager|designer|architect|consultant)",
            r"(?i)(intern|trainee|associate|lead|senior|junior|director)",
            r"(?i)(administrator|coordinator|specialist|scientist|researcher)",
        ]

        # Date range patterns (e.g., "Jan 2020 - Present")
        date_pattern = r"(?i)(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\.?\s*\d{4})"

        lines = text.split("\n")
        for line in lines:
            line = line.strip()
            if not line:
                continue

            has_job_title = any(re.search(p, line) for p in job_patterns)
            has_date = bool(re.search(date_pattern, line))

            if has_job_title or has_date:
                experience.append(line)

        # Deduplicate
        seen = set()
        unique_exp = []
        for e in experience:
            normalized = e.lower().strip()
            if normalized not in seen:
                seen.add(normalized)
                unique_exp.append(e.strip())

        return unique_exp if unique_exp else ["Not specified"]

    def _extract_projects(self, section_text):
        """
        Extract project entries from the projects section.

        Returns non-empty lines from the projects section.

        Returns:
            list[str]: Project descriptions/names.
        """
        if not section_text:
            return ["Not specified"]

        projects = []
        for line in section_text.split("\n"):
            line = line.strip()
            # Filter out very short lines (headers, bullets, etc.)
            if line and len(line) > 5:
                projects.append(line)

        return projects if projects else ["Not specified"]
