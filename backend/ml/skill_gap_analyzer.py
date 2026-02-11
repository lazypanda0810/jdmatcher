"""
ml/skill_gap_analyzer.py - Skill Gap Analysis Engine
-------------------------------------------------------
Identifies what skills a candidate is missing relative to a job description
and provides actionable improvement recommendations.

Features:
  - Categorizes missing skills as technical or soft
  - Generates personalized learning recommendations
  - Prioritizes gaps by importance (required vs. preferred)
"""

from ml.nlp_utils import categorize_skill


class SkillGapAnalyzer:
    """
    Analyzes the gap between a candidate's skills and the job requirements.
    Produces categorized gap lists and improvement recommendations.
    """

    # Recommendation templates for different skill categories
    TECH_RECOMMENDATIONS = {
        "python": "Complete a Python certification on Coursera or freeCodeCamp.",
        "java": "Practice Java fundamentals on LeetCode and build a Spring Boot project.",
        "javascript": "Build interactive web apps and study ES6+ features.",
        "react": "Complete the official React tutorial and build a portfolio project.",
        "angular": "Follow the Angular University course and build a CRUD application.",
        "vue": "Study Vue 3 Composition API and build a real-world SPA.",
        "django": "Build a RESTful API with Django REST Framework.",
        "flask": "Create a microservice with Flask and deploy it to the cloud.",
        "sql": "Practice SQL queries on HackerRank and study database design.",
        "mongodb": "Take the MongoDB University free courses.",
        "docker": "Containerize a sample app and learn Docker Compose.",
        "kubernetes": "Complete the Kubernetes basics on Katacoda.",
        "aws": "Study for the AWS Cloud Practitioner certification.",
        "azure": "Explore Azure Fundamentals (AZ-900) certification path.",
        "machine learning": "Complete Andrew Ng's ML course on Coursera.",
        "deep learning": "Study the fast.ai practical deep learning course.",
        "tensorflow": "Follow TensorFlow's official tutorials and build a model.",
        "pytorch": "Work through PyTorch's 60-minute blitz tutorial.",
        "git": "Learn Git workflows including branching and rebasing.",
        "ci/cd": "Set up a CI/CD pipeline using GitHub Actions or Jenkins.",
        "rest": "Study RESTful API design principles and build sample APIs.",
        "api": "Learn API design best practices and implement rate limiting.",
        "graphql": "Build a GraphQL server and explore schema design.",
        "microservices": "Study microservice patterns and implement a sample architecture.",
        "agile": "Get familiar with Agile/Scrum methodology and ceremonies.",
        "testing": "Learn unit testing frameworks (pytest, JUnit) and TDD.",
        "data analysis": "Practice with pandas, Excel, and data visualization tools.",
        "nlp": "Study NLP fundamentals with spaCy and build a text classifier.",
    }

    SOFT_RECOMMENDATIONS = {
        "communication": "Join a public speaking club (e.g., Toastmasters) and practice writing.",
        "leadership": "Take on leadership roles in team projects or community groups.",
        "teamwork": "Participate in hackathons or open-source collaborative projects.",
        "problem solving": "Practice algorithmic challenges on LeetCode or Codeforces.",
        "problem-solving": "Practice algorithmic challenges on LeetCode or Codeforces.",
        "critical thinking": "Take online courses on analytical reasoning and decision making.",
        "time management": "Use time-blocking techniques and tools like Pomodoro.",
        "adaptability": "Expose yourself to new technologies and cross-functional projects.",
        "creativity": "Engage in design thinking workshops and brainstorming sessions.",
        "project management": "Study PMP basics or take an introductory Scrum Master course.",
    }

    def analyze(self, candidate_skills, required_skills, preferred_skills):
        """
        Perform skill gap analysis.

        Args:
            candidate_skills (list):   Skills the candidate possesses.
            required_skills (list):    Skills required by the JD.
            preferred_skills (list):   Nice-to-have skills from the JD.

        Returns:
            dict: {
                "skill_gap": {
                    "technical": [...],
                    "soft": [...]
                },
                "recommendations": [str, ...]
            }
        """
        candidate_set = {s.lower() for s in candidate_skills}
        required_set = {s.lower() for s in required_skills}
        preferred_set = {s.lower() for s in preferred_skills}

        # Identify all missing skills (union of required + preferred minus candidate)
        all_required = required_set | preferred_set
        missing = all_required - candidate_set

        # Categorize missing skills
        technical_gaps = []
        soft_gaps = []

        for skill in sorted(missing):
            category = categorize_skill(skill)
            if category == "technical":
                technical_gaps.append(skill)
            else:
                soft_gaps.append(skill)

        # Generate recommendations based on the missing skills
        recommendations = self._generate_recommendations(
            technical_gaps, soft_gaps, required_set, candidate_set
        )

        return {
            "skill_gap": {
                "technical": technical_gaps,
                "soft": soft_gaps,
            },
            "recommendations": recommendations,
        }

    def _generate_recommendations(
        self, technical_gaps, soft_gaps, required_set, candidate_set
    ):
        """
        Generate personalized improvement recommendations.

        Priority:
        1. Required technical skills are addressed first.
        2. Then soft skills.
        3. General advice is appended.

        Returns:
            list[str]: Ordered list of recommendations.
        """
        recommendations = []

        # Technical skill recommendations (prioritize required)
        for skill in technical_gaps:
            if skill in self.TECH_RECOMMENDATIONS:
                priority = "HIGH" if skill in required_set else "MEDIUM"
                recommendations.append(
                    f"[{priority}] {skill.title()}: "
                    f"{self.TECH_RECOMMENDATIONS[skill]}"
                )
            else:
                priority = "HIGH" if skill in required_set else "MEDIUM"
                recommendations.append(
                    f"[{priority}] {skill.title()}: "
                    f"Explore online tutorials, documentation, and hands-on projects."
                )

        # Soft skill recommendations
        for skill in soft_gaps:
            if skill in self.SOFT_RECOMMENDATIONS:
                recommendations.append(
                    f"[MEDIUM] {skill.title()}: "
                    f"{self.SOFT_RECOMMENDATIONS[skill]}"
                )
            else:
                recommendations.append(
                    f"[MEDIUM] {skill.title()}: "
                    f"Develop this skill through practice and real-world scenarios."
                )

        # General advice if there are significant gaps
        if len(technical_gaps) + len(soft_gaps) > 5:
            recommendations.append(
                "[INFO] Consider focusing on the HIGH-priority skills first "
                "to maximize your match score."
            )

        if not recommendations:
            recommendations.append(
                "[INFO] Great match! Your skills align well with this position."
            )

        return recommendations
