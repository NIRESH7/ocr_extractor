# Local RAG with Qdrant, Llama, FastAPI, and React

This project implements a Retrieval Augmented Generation (RAG) system running entirely locally. It allows you to upload documents and ask questions about them using a local LLM.

## Tech Stack
- **Backend**: FastAPI, LangChain, Qdrant (Vector DB), Ollama (LLM)
- **Frontend**: React, Vite, Tailwind CSS

## Prerequisites
1. **Ollama**: Must be installed and running.
   - Download from [ollama.com](https://ollama.com).
   - Pull a model: `ollama pull llama2` (or `llama3`).
2. **Python 3.10+**
3. **Node.js 18+**

## Setup & Run

### 1. Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
The UI will be available at `http://localhost:5173`.

### Quick Start (Windows)
Run the provided PowerShell script:
```powershell
.\start_dev.ps1
```
