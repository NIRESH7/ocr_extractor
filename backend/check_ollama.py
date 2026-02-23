import requests
import sys

def check_ollama():
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            print("Ollama is running!")
            models = response.json().get('models', [])
            print("Available models:", [m['name'] for m in models])
            return True
        else:
            print(f"Ollama responded with status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to Ollama at http://localhost:11434")
        print("Please ensure Ollama is installed and running.")
        return False

if __name__ == "__main__":
    success = check_ollama()
    if not success:
        sys.exit(1)
