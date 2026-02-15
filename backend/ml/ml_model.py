"""
ml/ml_model.py - Machine Learning Match Prediction Model
-----------------------------------------------------------
Trainable ML model that learns from historical match data to predict
match scores and classify match quality.

Models:
  - GradientBoostingRegressor: Predicts numeric match score (0–100)
  - RandomForestClassifier: Classifies match quality (Strong/Good/Fair/Weak)

Features engineered from:
  - TF-IDF similarity (NLP)
  - Semantic similarity (AI)
  - Skill match metrics
  - Experience & education scores

Libraries:
  - scikit-learn: GradientBoosting, RandomForest, StandardScaler
  - joblib: Model serialization
  - numpy: Feature engineering
"""

import os
import numpy as np
import joblib
from datetime import datetime

from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score


class MatchPredictor:
    """
    ML model that predicts match scores from extracted features.

    Uses:
      - GradientBoostingRegressor for score prediction (regression)
      - RandomForestClassifier for quality classification

    Supports:
      - Training on historical data
      - Prediction with confidence scores
      - Model persistence (save/load)
      - Feature importance analysis
      - Cold start handling (returns None when untrained)
    """

    MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
    PREDICTOR_PATH = os.path.join(MODELS_DIR, "match_predictor.joblib")
    CLASSIFIER_PATH = os.path.join(MODELS_DIR, "match_classifier.joblib")
    SCALER_PATH = os.path.join(MODELS_DIR, "feature_scaler.joblib")
    META_PATH = os.path.join(MODELS_DIR, "model_meta.joblib")

    # Feature names (order matters — must match extract_features output)
    FEATURE_NAMES = [
        "tfidf_similarity",
        "semantic_similarity",
        "skill_match_ratio",
        "required_skill_coverage",
        "preferred_skill_coverage",
        "experience_score",
        "education_score",
        "n_matched_skills",
        "n_missing_skills",
        "total_required_skills",
        "total_preferred_skills",
        "skill_diversity_score",
    ]

    QUALITY_LABELS = ["Weak Match", "Fair Match", "Good Match", "Strong Match"]

    def __init__(self):
        """Initialize and attempt to load a previously saved model."""
        self.predictor = None
        self.classifier = None
        self.scaler = None
        self.is_trained = False
        self.metadata = {}
        self._load_models()

    # ── Feature Engineering ──────────────────────────────────────────────

    def extract_features(
        self,
        tfidf_sim,
        semantic_sim,
        skill_score,
        experience_score,
        education_score,
        matched_skills,
        missing_skills,
        required_skills,
        preferred_skills,
    ):
        """
        Engineer a feature vector from raw match components.

        Creates 12 derived features that capture different aspects of
        the resume–JD match quality for ML prediction.

        Args:
            tfidf_sim (float):       TF-IDF cosine similarity (0–1).
            semantic_sim (float):    Semantic similarity from AI (0–1).
            skill_score (float):     Rule-based skill score (0–100).
            experience_score (float):Experience score (0–100).
            education_score (float): Education score (0–100).
            matched_skills (list):   Skills present in both resume and JD.
            missing_skills (list):   JD skills absent from resume.
            required_skills (list):  Required skills from JD.
            preferred_skills (list): Preferred skills from JD.

        Returns:
            numpy.ndarray: Feature vector of shape (1, 12).
        """
        n_matched = len(matched_skills) if isinstance(matched_skills, list) else int(matched_skills)
        n_missing = len(missing_skills) if isinstance(missing_skills, list) else int(missing_skills)
        n_required = len(required_skills) if isinstance(required_skills, list) else int(required_skills)
        n_preferred = len(preferred_skills) if isinstance(preferred_skills, list) else int(preferred_skills)

        total_job_skills = max(n_required + n_preferred, 1)

        # Derived features
        skill_match_ratio = n_matched / total_job_skills
        required_coverage = min(n_matched / max(n_required, 1), 1.0)
        preferred_coverage = min(
            max(0, n_matched - n_required) / max(n_preferred, 1), 1.0
        )
        skill_diversity = (
            len(set(matched_skills)) / max(total_job_skills, 1)
            if isinstance(matched_skills, list)
            else skill_match_ratio
        )

        features = np.array([
            tfidf_sim,
            semantic_sim,
            skill_match_ratio,
            required_coverage,
            preferred_coverage,
            experience_score / 100.0,
            education_score / 100.0,
            n_matched,
            n_missing,
            n_required,
            n_preferred,
            skill_diversity,
        ]).reshape(1, -1)

        return features

    # ── Training ─────────────────────────────────────────────────────────

    def train(self, X, y, retrain=False):
        """
        Train both the regression predictor and quality classifier.

        Pipeline:
          1. Scale features with StandardScaler.
          2. 80/20 train–test split.
          3. Train GradientBoostingRegressor (score prediction).
          4. Train RandomForestClassifier (quality classification).
          5. Evaluate with R², MAE, accuracy, cross-validation.
          6. Persist models to disk.

        Args:
            X (ndarray): Feature matrix (n_samples, 12).
            y (ndarray): Target match scores (0–100).
            retrain (bool): Force retraining if True.

        Returns:
            dict: Training metrics and feature importances.
        """
        if self.is_trained and not retrain:
            return {"message": "Model already trained. Use retrain=True to retrain."}

        # ── Scale features ───────────────────────────────────────────
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)

        # ── Split data ───────────────────────────────────────────────
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        # ── Train Regression Model (Score Predictor) ─────────────────
        self.predictor = GradientBoostingRegressor(
            n_estimators=200,
            max_depth=5,
            learning_rate=0.1,
            subsample=0.8,
            min_samples_split=5,
            random_state=42,
        )
        self.predictor.fit(X_train, y_train)

        # Evaluate regression
        y_pred = self.predictor.predict(X_test)
        r2 = r2_score(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        cv_scores = cross_val_score(
            self.predictor, X_scaled, y, cv=5, scoring="r2"
        )

        # ── Train Classification Model (Quality Classifier) ─────────
        y_labels_train = np.array([self._score_to_label_idx(s) for s in y_train])
        y_labels_test = np.array([self._score_to_label_idx(s) for s in y_test])

        self.classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            random_state=42,
        )
        self.classifier.fit(X_train, y_labels_train)

        # Evaluate classifier
        y_class_pred = self.classifier.predict(X_test)
        accuracy = accuracy_score(y_labels_test, y_class_pred)

        # ── Save models ──────────────────────────────────────────────
        self.is_trained = True
        self.metadata = {
            "trained_at": datetime.utcnow().isoformat(),
            "n_samples": len(X),
            "r2_score": round(r2, 4),
            "mae": round(mae, 4),
            "cv_mean_r2": round(float(np.mean(cv_scores)), 4),
            "classifier_accuracy": round(accuracy, 4),
            "feature_importances": dict(zip(
                self.FEATURE_NAMES,
                [round(float(x), 4) for x in self.predictor.feature_importances_],
            )),
        }
        self._save_models()

        return {
            "status": "success",
            "regression_metrics": {
                "r2_score": round(r2, 4),
                "mae": round(mae, 4),
                "cv_mean_r2": round(float(np.mean(cv_scores)), 4),
            },
            "classification_metrics": {
                "accuracy": round(accuracy, 4),
            },
            "feature_importances": self.metadata["feature_importances"],
            "n_training_samples": len(X),
        }

    # ── Prediction ───────────────────────────────────────────────────────

    def predict_score(self, features):
        """
        Predict match score using trained regression model.

        Args:
            features (ndarray): Feature vector from extract_features().

        Returns:
            float: Predicted score (0–100), or None if no model trained.
        """
        if not self.is_trained:
            return None
        features_scaled = self.scaler.transform(features)
        score = float(self.predictor.predict(features_scaled)[0])
        return round(min(max(score, 0), 100), 2)

    def predict_quality(self, features):
        """
        Classify match quality using trained classifier.

        Args:
            features (ndarray): Feature vector from extract_features().

        Returns:
            dict: {label, confidence, probabilities} or None if untrained.
        """
        if not self.is_trained or self.classifier is None:
            return None
        features_scaled = self.scaler.transform(features)
        label_idx = int(self.classifier.predict(features_scaled)[0])
        probabilities = self.classifier.predict_proba(features_scaled)[0]

        return {
            "label": self.QUALITY_LABELS[label_idx],
            "confidence": round(float(max(probabilities)) * 100, 1),
            "probabilities": {
                self.QUALITY_LABELS[i]: round(float(p) * 100, 1)
                for i, p in enumerate(probabilities)
            },
        }

    # ── Inspection ───────────────────────────────────────────────────────

    def get_feature_importance(self):
        """Return feature importance from the trained model."""
        if not self.is_trained:
            return None
        return self.metadata.get("feature_importances", {})

    def get_model_info(self):
        """Return metadata about the current model."""
        if not self.is_trained:
            return {"status": "not_trained", "message": "No trained model available."}
        return {"status": "trained", **self.metadata}

    # ── Internal Helpers ─────────────────────────────────────────────────

    @staticmethod
    def _score_to_label_idx(score):
        """Convert numeric score to quality label index."""
        if score >= 80:
            return 3  # Strong Match
        elif score >= 60:
            return 2  # Good Match
        elif score >= 40:
            return 1  # Fair Match
        else:
            return 0  # Weak Match

    def _save_models(self):
        """Persist trained models to disk."""
        os.makedirs(self.MODELS_DIR, exist_ok=True)
        joblib.dump(self.predictor, self.PREDICTOR_PATH)
        joblib.dump(self.scaler, self.SCALER_PATH)
        joblib.dump(self.metadata, self.META_PATH)
        if self.classifier:
            joblib.dump(self.classifier, self.CLASSIFIER_PATH)
        print(f"[ML Model] Models saved to {self.MODELS_DIR}")

    def _load_models(self):
        """Load previously saved models from disk."""
        try:
            if os.path.exists(self.PREDICTOR_PATH) and os.path.exists(self.SCALER_PATH):
                self.predictor = joblib.load(self.PREDICTOR_PATH)
                self.scaler = joblib.load(self.SCALER_PATH)
                self.is_trained = True
                if os.path.exists(self.CLASSIFIER_PATH):
                    self.classifier = joblib.load(self.CLASSIFIER_PATH)
                if os.path.exists(self.META_PATH):
                    self.metadata = joblib.load(self.META_PATH)
                print("[ML Model] Loaded saved models successfully.")
        except Exception as e:
            print(f"[ML Model] Could not load saved model: {e}")
            self.is_trained = False


# ── Synthetic Data Generator ─────────────────────────────────────────────

def generate_synthetic_training_data(n_samples=500):
    """
    Generate synthetic training data for bootstrapping the ML model
    when no historical match data is available yet.

    Creates realistic, correlated feature combinations with corresponding
    match scores that follow natural distributions.

    Args:
        n_samples (int): Number of training samples to generate.

    Returns:
        tuple: (X, y) — feature matrix and target scores.
    """
    np.random.seed(42)

    data = []
    for _ in range(n_samples):
        # Base quality factor (Beta distribution for realistic spread)
        base_quality = np.random.beta(2, 2)  # 0–1, centered at 0.5

        # Generate correlated features
        tfidf_sim = np.clip(base_quality + np.random.normal(0, 0.15), 0, 1)
        semantic_sim = np.clip(base_quality + np.random.normal(0, 0.10), 0, 1)

        n_required = np.random.randint(3, 15)
        n_preferred = np.random.randint(1, 8)
        n_matched = int(np.clip(
            base_quality * (n_required + n_preferred) + np.random.randint(-2, 3),
            0, n_required + n_preferred,
        ))
        n_missing = (n_required + n_preferred) - n_matched

        total = max(n_required + n_preferred, 1)
        skill_match_ratio = n_matched / total
        req_coverage = min(n_matched / max(n_required, 1), 1.0)
        pref_coverage = min(max(0, n_matched - n_required) / max(n_preferred, 1), 1.0)

        exp_score = np.clip(base_quality + np.random.normal(0, 0.15), 0, 1)
        edu_score = np.clip(base_quality + np.random.normal(0, 0.20), 0, 1)

        skill_diversity = np.clip(skill_match_ratio + np.random.normal(0, 0.1), 0, 1)

        features = [
            tfidf_sim, semantic_sim, skill_match_ratio,
            req_coverage, pref_coverage, exp_score, edu_score,
            n_matched, n_missing, n_required, n_preferred, skill_diversity,
        ]

        # Target score: weighted combination with realistic noise
        target = (
            semantic_sim * 25
            + skill_match_ratio * 30
            + req_coverage * 15
            + exp_score * 20
            + edu_score * 10
            + np.random.normal(0, 3)
        )
        target = np.clip(target, 0, 100)

        data.append((features, target))

    X = np.array([d[0] for d in data])
    y = np.array([d[1] for d in data])

    return X, y
