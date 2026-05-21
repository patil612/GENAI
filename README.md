# Auto-Redline: A GenAI-Based Contract Modification and Policy Alignment System

## Overview
Auto-Redline is a full-stack AI application designed to automatically analyze legal contracts, identify clauses that violate company policies, rewrite them for compliance using Generative AI (Llama 3), and provide explanations for the modifications.

## Features
- Upload PDF, DOCX, or TXT contracts.
- Upload/Select company policy templates.
- Automatic extraction and segmentation of clauses.
- Policy-matching to identify risk and compliance issues.
- GenAI rewriting of non-compliant clauses.
- Redline comparison view for clear visualization of changes.
- Explanation generation for all AI modifications.

## Tech Stack
- **Frontend:** React.js, Tailwind CSS
- **Backend:** Python, FastAPI
- **AI/ML:** Hugging Face Transformers, Llama 3 8B, LoRA/QLoRA, PEFT
- **Database:** MongoDB
- **Deployment:** Docker

## Project Structure
- `frontend/` - React application.
- `backend/` - FastAPI backend application and API routes.
- `models/` - AI/ML inference models.
- `training/` - Scripts for dataset preparation and LoRA fine-tuning.
- `datasets/` - Training and evaluation datasets.
- `docs/` - Project report, PPT content, and documentation.

## Setup Instructions

### Local Development
1. **Backend:**
   ```bash
   cd backend
   pip install -r ../requirements.txt
   uvicorn main:app --reload
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### Docker
```bash
docker-compose up --build
```
