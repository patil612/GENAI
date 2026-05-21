# Project Report: Auto-Redline

## 1. Project Title
Auto-Redline: A GenAI-Based Contract Modification and Policy Alignment System

## 2. Domain
Machine Learning / Generative AI / Legal Tech / NLP

## 3. Problem Statement
Manual contract review is time-consuming and requires legal expertise to identify clauses that violate company policies. Existing AI tools mainly assist in clause detection or summarization but do not automatically modify non-compliant clauses. Therefore, there is a need for a GenAI-based intelligent system that analyzes legal contracts, detects policy-violating clauses, automatically rewrites those clauses preserving legal meaning and structure, and generates explanations for every modification.

## 4. Objectives
- Identify contract clauses that violate predefined company policies.
- Automatically rewrite non-compliant clauses while preserving original legal meaning.
- Generate explanations for every modification.
- Provide an easy-to-use interface for contract upload and review.
- Highlight original and modified clauses using redline comparison.
- Support PDF and DOCX contracts.

## 5. Literature Survey
- **CUAD:** Large dataset for legal contract clause extraction. *Limitation:* Requires expert labeling and does not address rewriting.
- **ContractEval:** Evaluates LLMs for risky clause detection. Highlights proprietary models' performance over open-source. *Limitation:* Reliability of open-source models for this task requires specialized fine-tuning.
- **Logical Relation in Clauses:** Uses NLI transformer models to detect contradiction and entailment.
- **ConReader:** Hidden relation-based clause extraction using contextual understanding.
- **Consistency Analysis:** Logic-based contradiction detection. *Limitation:* No clause rewriting.

## 6. System Architecture
The system consists of the following modules:
1. **Document Upload Module:** Handles PDF/DOCX ingestion.
2. **Text Extraction Module:** Parses raw text from documents.
3. **Clause Segmentation Module:** Splits text into legal clauses.
4. **Policy Matching Engine:** Compares clauses against stored policies.
5. **Risk Detection Engine:** Identifies discrepancies.
6. **LLM Rewriting Engine:** Uses fine-tuned Llama 3 8B (via LoRA) to rewrite clauses.
7. **Explanation Generator:** Prompts LLM to explain the rationale for changes.
8. **Redline Comparison Module:** UI component to show diffs.
9. **Report Generator:** Exports the final compliant contract and audit trail.

## 7. Model Details
- **Base Model:** Llama 3 8B
- **Fine-Tuning:** LoRA / QLoRA for parameter-efficient fine-tuning.
- **Frameworks:** Hugging Face Transformers, PEFT, Unsloth (optional).

## 8. Evaluation Metrics
- **Accuracy, Precision, Recall, F1-score:** For policy violation detection.
- **BLEU Score & Semantic Similarity Score:** For evaluating the quality of rewritten clauses against human benchmarks.
