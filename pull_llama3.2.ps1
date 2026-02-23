$OllamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (Test-Path $OllamaPath) {
    Write-Host "--- [AI UPGRADE] Found Ollama at $OllamaPath ---" -ForegroundColor Cyan
    
    Write-Host "Step 1: Pulling llama3.2 (This is about 2GB, please wait)..." -ForegroundColor Yellow
    & $OllamaPath pull llama3.2
    
    Write-Host "`nStep 2: Removing old tinyllama model..." -ForegroundColor Yellow
    & $OllamaPath rm tinyllama
    
    Write-Host "`n--- [SUCCESS] Neural RAG is now upgraded to Llama 3.2! ---" -ForegroundColor Green
    Write-Host "You can now go back to your browser and ask questions." -ForegroundColor Green
} else {
    Write-Host "ERROR: Could not find Ollama at $OllamaPath" -ForegroundColor Red
    Write-Host "Please ensure Ollama is installed on your Windows machine." -ForegroundColor Red
}
