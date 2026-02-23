$OllamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"

if (Test-Path $OllamaPath) {
    Write-Host "Found Ollama at $OllamaPath"
    Write-Host "Pulling llama2 model..."
    & $OllamaPath pull llama2
} else {
    Write-Host "Could not find Ollama executable at $OllamaPath"
    Write-Host "Please ensure it is installed."
}
