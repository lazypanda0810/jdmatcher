"""
ml/ai_engine.py - AI-Powered Semantic Analysis Engine
-------------------------------------------------------
Uses deep learning transformer models (BERT-based) for semantic understanding
of resumes and job descriptions — going beyond keyword matching.

Capabilities:
  - Semantic similarity via sentence-transformer embeddings
  - Context-aware skill relevance scoring
  - Batch candidate ranking against a JD
  - Dense vector embeddings for downstream tasks

Falls back gracefully to TF-IDF if sentence-transformers is not installed.

Libraries:
  - sentence-transformers (HuggingFace): all-MiniLM-L6-v2 model
  - scikit-learn: cosine similarity computation
"""

import numpy as np

# Try to import sentence-transformers (deep learning AI)
try:
    from sentence_transformers import SentenceTransformer
    from sklearn.metrics.pairwise import cosine_similarity as sk_cosine_similarity
    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False

from ml.nlp_utils import get_preprocessed_string


class AIEngine:
    """
    AI-powered semantic similarity engine using transformer models.

    Uses the all-MiniLM-L6-v2 sentence-transformer model to create
    384-dimensional dense vector embeddings of text, enabling deep
    semantic understanding that captures meaning beyond keyword overlap.

    Architecture:
      Input Text → BERT Tokenizer → Transformer Encoder → Mean Pooling → 384-d Embedding

    Falls back to TF-IDF vectorization if sentence-transformers is not installed.
    """

    MODEL_NAME = "all-MiniLM-L6-v2"

    def __init__(self):
        """Load the transformer model (or set up fallback)."""
        self.model = None
        self.ai_available = False
        self._load_model()

    def _load_model(self):
        """Attempt to load the sentence-transformer model."""
        if TRANSFORMERS_AVAILABLE:
            try:
                self.model = SentenceTransformer(self.MODEL_NAME)
                self.ai_available = True
                print(f"[AI Engine] Loaded transformer model: {self.MODEL_NAME}")
            except Exception as e:
                print(f"[AI Engine] Failed to load transformer model: {e}")
                self.ai_available = False
        else:
            print("[AI Engine] sentence-transformers not installed. Using TF-IDF fallback.")

    # ── Primary Methods ──────────────────────────────────────────────────

    def compute_semantic_similarity(self, text_a, text_b):
        """
        Compute deep semantic similarity between two texts.

        Unlike TF-IDF (which counts word frequencies), transformer embeddings
        capture contextual meaning. For example:
          - "Python developer" and "software engineer using Python"
            → high similarity even with different surface words.

        Args:
            text_a (str): First text (e.g., resume).
            text_b (str): Second text (e.g., job description).

        Returns:
            float: Semantic similarity score between 0 and 1.
        """
        if not text_a or not text_b:
            return 0.0
        if not text_a.strip() or not text_b.strip():
            return 0.0

        if not self.ai_available:
            return self._tfidf_fallback(text_a, text_b)

        try:
            embeddings = self.model.encode([text_a, text_b])
            similarity = sk_cosine_similarity([embeddings[0]], [embeddings[1]])
            return float(similarity[0][0])
        except Exception as e:
            print(f"[AI Engine] Semantic similarity error: {e}")
            return self._tfidf_fallback(text_a, text_b)

    def get_embedding(self, text):
        """
        Get the dense 384-dimensional vector embedding of a text.

        Useful for:
          - Storing embeddings for fast retrieval
          - Clustering similar resumes/JDs
          - Building recommendation systems

        Args:
            text (str): Input text.

        Returns:
            numpy.ndarray: 384-dimensional embedding vector, or None.
        """
        if not self.ai_available or not text:
            return None
        try:
            return self.model.encode(text)
        except Exception:
            return None

    def rank_candidates(self, job_text, resume_texts):
        """
        Rank multiple resumes against a single JD using AI embeddings.

        Encodes all texts into the same embedding space and computes
        cosine similarity between the JD and each resume.

        Args:
            job_text (str): Job description text.
            resume_texts (list[str]): List of resume texts.

        Returns:
            list[float]: Similarity scores for each resume (0 to 1).
        """
        if not self.ai_available or not resume_texts:
            return [0.0] * len(resume_texts)

        try:
            job_embedding = self.model.encode([job_text])
            resume_embeddings = self.model.encode(resume_texts)
            similarities = sk_cosine_similarity(job_embedding, resume_embeddings)
            return similarities[0].tolist()
        except Exception as e:
            print(f"[AI Engine] Batch ranking error: {e}")
            return [0.0] * len(resume_texts)

    def compute_contextual_skill_relevance(self, skill, job_context):
        """
        Determine how relevant a specific skill is within a job context.

        Goes beyond keyword matching: "React" might score high for a
        front-end role but lower for a data engineering role, even if
        both mention it.

        Args:
            skill (str): Skill name (e.g., "React").
            job_context (str): Full job description text.

        Returns:
            float: Relevance score between 0 and 1.
        """
        if not self.ai_available or not skill or not job_context:
            return 0.5  # Neutral default

        try:
            skill_text = f"Professional experience with {skill}"
            embeddings = self.model.encode([skill_text, job_context])
            similarity = sk_cosine_similarity([embeddings[0]], [embeddings[1]])
            return float(similarity[0][0])
        except Exception:
            return 0.5

    # ── Fallback ─────────────────────────────────────────────────────────

    def _tfidf_fallback(self, text_a, text_b):
        """
        Fallback to TF-IDF cosine similarity when transformer model
        is not available. Less accurate but still useful.
        """
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        processed_a = get_preprocessed_string(text_a)
        processed_b = get_preprocessed_string(text_b)

        if not processed_a.strip() or not processed_b.strip():
            return 0.0

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([processed_a, processed_b])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        return float(similarity[0][0])
