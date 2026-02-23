$ErrorActionPreference = "Stop"

Write-Host "Starting Local RAG System..." -ForegroundColor Green

# Define Ollama Path
$OllamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

# Check for Ollama
Write-Host "Checking Ollama..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -Method Get -ErrorAction Stop
    Write-Host "Ollama is running." -ForegroundColor Cyan
} catch {
    Write-Host "Ollama is not responding at http://localhost:11434" -ForegroundColor Yellow
    
    if (Test-Path $OllamaPath) {
        Write-Host "Attempting to start Ollama from $OllamaPath..."
        Start-Process $OllamaPath -ArgumentList "serve" -WindowStyle Hidden
        Write-Host "Ollama started. Waiting 10 seconds for initialization..."
        Start-Sleep -Seconds 10
    } else {
        Write-Host "Error: Ollama not found at $OllamaPath" -ForegroundColor Red
        Write-Host "Please run .\install_ollama.ps1 or install manually from ollama.com"
        exit 1
    }
}

# Start Backend
Write-Host "Starting Backend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\activate; uvicorn main:app --reload"
Write-Host "Backend started in new window." -ForegroundColor Cyan

# Start Frontend
Write-Host "Starting Frontend..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
Write-Host "Frontend started in new window." -ForegroundColor Cyan

Write-Host "System is up! Access the UI at http://localhost:5173" -ForegroundColor Green
