"""
train_model.py - Train the ML Match Prediction Model
-------------------------------------------------------
Run this script to train or retrain the ML model used for
match score prediction and quality classification.

Usage:
    python train_model.py              # Train with synthetic data
    python train_model.py --retrain    # Force retrain existing model

The trained model is saved to ml/saved_models/ and will be
automatically loaded by the matching engine on next startup.
"""

import sys
import os

# Ensure the backend directory is in the path
sys.path.insert(0, os.path.dirname(__file__))

from ml.ml_model import MatchPredictor, generate_synthetic_training_data


def main():
    print("=" * 60)
    print("  JDMatcher - ML Model Training Pipeline")
    print("=" * 60)

    retrain = "--retrain" in sys.argv

    predictor = MatchPredictor()

    if predictor.is_trained and not retrain:
        print("\n  Model already trained. Current info:")
        info = predictor.get_model_info()
        for k, v in info.items():
            if k != "feature_importances":
                print(f"    {k}: {v}")
        print("\n  Use --retrain to force retraining.")
        return

    # ── Step 1: Generate training data ───────────────────────────────
    # In production, you would load real match data from MongoDB here.
    # For bootstrapping, we use synthetic data.
    print("\n[1/3] Generating synthetic training data...")
    X, y = generate_synthetic_training_data(n_samples=1000)
    print(f"  Generated {len(X)} samples with {X.shape[1]} features each")
    print(f"  Score range: {y.min():.1f} - {y.max():.1f}")
    print(f"  Score mean:  {y.mean():.1f} (+/- {y.std():.1f})")

    # ── Step 2: Train models ─────────────────────────────────────────
    print("\n[2/3] Training ML models...")
    print("  - GradientBoostingRegressor (score prediction)")
    print("  - RandomForestClassifier (quality classification)")
    metrics = predictor.train(X, y, retrain=True)

    # ── Step 3: Report results ───────────────────────────────────────
    print("\n[3/3] Training Results:")
    print(f"\n  Regression (Score Prediction):")
    print(f"    R² Score:          {metrics['regression_metrics']['r2_score']}")
    print(f"    Mean Abs Error:    {metrics['regression_metrics']['mae']}")
    print(f"    Cross-Val R² (5):  {metrics['regression_metrics']['cv_mean_r2']}")

    print(f"\n  Classification (Quality Prediction):")
    print(f"    Accuracy:          {metrics['classification_metrics']['accuracy']}")

    print(f"\n  Feature Importances:")
    sorted_feats = sorted(
        metrics["feature_importances"].items(),
        key=lambda x: -x[1],
    )
    for feat, imp in sorted_feats:
        bar = "█" * int(imp * 50)
        print(f"    {feat:<30} {imp:.4f} {bar}")

    print(f"\n  Models saved to: ml/saved_models/")
    print("=" * 60)

    # ── Quick verification ───────────────────────────────────────────
    print("\n  Quick Prediction Test:")
    import numpy as np

    test_features = predictor.extract_features(
        tfidf_sim=0.65,
        semantic_sim=0.72,
        skill_score=78.0,
        experience_score=85.0,
        education_score=100.0,
        matched_skills=["python", "django", "sql", "git"],
        missing_skills=["kubernetes", "aws"],
        required_skills=["python", "django", "sql", "kubernetes", "aws"],
        preferred_skills=["git", "docker"],
    )
    score = predictor.predict_score(test_features)
    quality = predictor.predict_quality(test_features)
    print(f"    Predicted Score: {score}")
    print(f"    Quality Label:   {quality['label']} ({quality['confidence']}% confidence)")
    print()


if __name__ == "__main__":
    main()
