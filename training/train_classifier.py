import pandas as pd
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

def train_model():
    print("Loading dataset...")
    # Check which datasets are available
    dataset_paths = [
        "../datasets/massive_legal_dataset.csv",
        "../datasets/massive_legal_dataset_part2.csv"
    ]
    
    selected_path = None
    for path in dataset_paths:
        if os.path.exists(path):
            selected_path = path
            break
            
    if not selected_path:
        raise FileNotFoundError("Could not find any of the massive legal datasets in the datasets folder.")
        
    print(f"Loading data from {selected_path}...")
    # Load a subset of 50,000 rows to ensure fast CPU training while maintaining high accuracy
    df = pd.read_csv(selected_path, nrows=50000)
    print(f"Loaded {len(df)} rows.")
    
    # Preprocess
    # Combine original_clause and company_policy into a single text feature
    df['feature_text'] = "Clause: " + df['original_clause'] + " | Policy: " + df['company_policy']
    df['target'] = df['compliance_status'].map({'Compliant': 0, 'Non-Compliant': 1})
    
    X = df['feature_text']
    y = df['target']
    
    # Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Vectorizing text using TF-IDF...")
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=10000)
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)
    
    print("Training Logistic Regression Classifier...")
    classifier = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
    classifier.fit(X_train_vec, y_train)
    
    # Evaluate
    y_pred = classifier.predict(X_test_vec)
    accuracy = accuracy_score(y_test, y_pred)
    
    print("\n" + "="*50)
    print("MODEL TRAINING & EVALUATION COMPLETE")
    print("="*50)
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=['Compliant', 'Non-Compliant']))
    
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    print("="*50 + "\n")
    
    # Save the model
    os.makedirs("../models", exist_ok=True)
    with open("../models/compliance_classifier.pkl", "wb") as f:
        pickle.dump(classifier, f)
    with open("../models/tfidf_vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)
    print("Saved model and vectorizer to models/ directory.")

if __name__ == "__main__":
    train_model()
