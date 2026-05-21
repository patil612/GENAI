# Auto-Redline: Presentation Content

## Slide 1: Title Slide
- **Title:** Auto-Redline: A GenAI-Based Contract Modification and Policy Alignment System
- **Domain:** Machine Learning / Generative AI / Legal Tech / NLP
- **Presenter:** [Your Name/Team Name]

## Slide 2: Problem Statement
- Manual contract review is tedious and requires deep legal expertise.
- Existing tools only detect or summarize risky clauses.
- **The Gap:** No automatic modification of non-compliant clauses.
- **The Solution:** A GenAI system to detect, rewrite, and explain policy-violating clauses while preserving legal semantics.

## Slide 3: Objectives
- Identify clauses violating company policies.
- Automatically rewrite non-compliant clauses.
- Generate human-readable explanations for changes.
- Provide intuitive UI with redline comparison.
- Support standard document formats (PDF/DOCX).

## Slide 4: Literature Survey
- **CUAD & ContractEval:** Good for extraction and detection, but lack rewriting capabilities.
- **NLI Transformer Models:** Detect contradiction and entailment between clauses and policies.
- **Limitation Addressed:** Auto-Redline closes the loop by actually rewriting the text using LLMs.

## Slide 5: System Architecture
- Document Upload & Text Extraction
- Clause Segmentation
- Policy Matching & Risk Detection Engines
- **LLM Rewriting & Explanation Engine (Llama 3 8B)**
- Redline Comparison & Report Generation

## Slide 6: Model & Tech Stack
- **AI/ML:** Llama 3 8B, LoRA/QLoRA, Hugging Face, PEFT
- **Backend:** Python, FastAPI
- **Frontend:** React.js, Tailwind CSS
- **Database & Deployment:** MongoDB, Docker

## Slide 7: Dataset & Training Approach
- Custom dataset pairing original clauses, policies, rewritten clauses, and explanations.
- Parameter-Efficient Fine-Tuning (PEFT) with LoRA to adapt Llama 3 on consumer hardware.

## Slide 8: Evaluation Metrics
- Detection Metrics: Accuracy, Precision, Recall, F1-score.
- Rewriting Quality: BLEU score, Semantic Similarity Score (e.g., BERTScore).

## Slide 9: Sample Output
- **Original:** "Payment within 90 days."
- **Policy:** "Net 30 days."
- **AI Rewrite:** "Payment within 30 days."
- **Explanation:** "Reduced payment term to comply with Net 30 policy."

## Slide 10: Future Enhancements & Conclusion
- Multi-language support and OCR for scanned PDFs.
- Chatbot assistant for legal queries.
- **Conclusion:** Auto-Redline significantly reduces manual review effort and improves contract compliance speed.
