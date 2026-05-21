import os
import json
import pickle
import re
from typing import List

class TrainedAIService:
    def __init__(self):
        # Paths relative to the backend directory
        self.model_path = "../models/compliance_classifier.pkl"
        self.vectorizer_path = "../models/tfidf_vectorizer.pkl"
        self.dataset_path = "../datasets/sample_dataset.json"

        self.classifier = None
        self.vectorizer = None
        self.mock_data = []

        # Load the trained model and vectorizer
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
                with open(self.model_path, "rb") as f:
                    self.classifier = pickle.load(f)
                with open(self.vectorizer_path, "rb") as f:
                    self.vectorizer = pickle.load(f)
                print("Successfully loaded trained compliance classifier and vectorizer.")
            else:
                print("Trained model files not found. Falling back to mock detection.")
        except Exception as e:
            print(f"Error loading trained model files: {e}")

        # Load the sample dataset for rewriting and explanation templates
        try:
            if os.path.exists(self.dataset_path):
                with open(self.dataset_path, "r") as f:
                    self.mock_data = json.load(f)
        except Exception as e:
            print(f"Error loading sample dataset: {e}")

    def segment_clauses(self, text: str) -> List[str]:
        # Split by period followed by space, or by newlines
        sentences = re.split(r'\.\s+|\n+', text)
        return [s.strip() for s in sentences if s.strip()]

    def find_best_rewrite(self, clause: str, policy: str):
        # Find matching clause in mock_data based on token overlap
        best_match = None
        max_overlap = -1

        clause_tokens = set(clause.lower().split())
        for item in self.mock_data:
            item_tokens = set(item['clause'].lower().split())
            overlap = len(clause_tokens.intersection(item_tokens))
            if overlap > max_overlap:
                max_overlap = overlap
                best_match = item

        if best_match and max_overlap > 2:  # Require some minimal similarity
            return best_match['rewritten_clause'], best_match['explanation']
        
        # Fallback dynamic rewrite if no close match is found
        return f"[AI Modified] {clause}", f"Modified to align with policy: '{policy}'."

    def analyze_contract(self, text: str, policy: str):
        if not self.classifier or not self.vectorizer:
            return self._fallback_mock_analysis()

        clauses = self.segment_clauses(text)
        results = []
        violation_count = 0

        for clause in clauses:
            combined_text = f"Clause: {clause} | Policy: {policy}"
            X_vec = self.vectorizer.transform([combined_text])
            
            # Predict compliance
            pred = self.classifier.predict(X_vec)[0]
            # Get risk score (probability of non-compliance)
            prob = self.classifier.predict_proba(X_vec)[0][1]

            # If model classifies as non-compliant, flag it
            if pred == 1:
                rewritten, explanation = self.find_best_rewrite(clause, policy)
                results.append({
                    "id": violation_count,
                    "original_clause": clause,
                    "violated_policy": policy,
                    "rewritten_clause": rewritten,
                    "explanation": explanation,
                    "risk_score": round(float(prob), 2)
                })
                violation_count += 1

        return results

    def _fallback_mock_analysis(self):
        results = []
        for i, sample in enumerate(self.mock_data[:2]):
            results.append({
                "id": i,
                "original_clause": sample["clause"],
                "violated_policy": sample["policy"],
                "rewritten_clause": sample["rewritten_clause"],
                "explanation": sample["explanation"],
                "risk_score": 0.85
            })
        return results

ai_service = TrainedAIService()

