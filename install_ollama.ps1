Write-Host "Installing Ollama via Winget..."
winget install -e --id Ollama.Ollama

Write-Host "----------------------------------------------------------------"
Write-Host "IMPORTANT: After installation completes, you MUST restart your terminal"
Write-Host "or Open a new PowerShell window for the 'ollama' command to be recognized."
Write-Host "Then run: ollama pull llama2"
Write-Host "----------------------------------------------------------------"
