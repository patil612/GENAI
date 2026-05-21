import json
import random

class MockAIService:
    def __init__(self):
        # Load the mock dataset for realistic responses
        try:
            with open("../datasets/sample_dataset.json", "r") as f:
                self.mock_data = json.load(f)
        except Exception:
            self.mock_data = []

    def analyze_contract(self, text: str, policy: str):
        # In a real system, this would segment text and use NLI to find violations.
        # For mock purposes, we return a few simulated violations.
        results = []
        if self.mock_data:
            # Pick a few random items from the dataset to simulate found violations
            samples = random.sample(self.mock_data, min(2, len(self.mock_data)))
            for i, sample in enumerate(samples):
                results.append({
                    "id": i,
                    "original_clause": sample["clause"],
                    "violated_policy": sample["policy"],
                    "rewritten_clause": sample["rewritten_clause"],
                    "explanation": sample["explanation"],
                    "risk_score": round(random.uniform(0.7, 0.99), 2)
                })
        else:
            results = [{
                "id": 1,
                "original_clause": "Payment within 90 days.",
                "violated_policy": "Net 30 days.",
                "rewritten_clause": "Payment within 30 days.",
                "explanation": "Reduced payment term to comply with Net 30 policy.",
                "risk_score": 0.85
            }]
        
        return results

ai_service = MockAIService()
