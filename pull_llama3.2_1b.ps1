$OllamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (Test-Path $OllamaPath) {
    Write-Host "--- [AI SPEED UP] Found Ollama at $OllamaPath ---" -ForegroundColor Cyan
    
    Write-Host "Step 1: Pulling llama3.2:1b (This is the fast version, ~1GB)..." -ForegroundColor Yellow
    & $OllamaPath pull llama3.2:1b
    
    Write-Host "`n--- [SUCCESS] Neural RAG is now ready for High-Speed Mode (Llama 3.2 1B)! ---" -ForegroundColor Green
    Write-Host "I have updated the backend to use this fast model. Restart your backend now." -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not find Ollama at $OllamaPath" -ForegroundColor Red
}
