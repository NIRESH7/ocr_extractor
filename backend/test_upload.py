import requests
import os

# Create a dummy file
with open("test_doc.txt", "w") as f:
    f.write("This is a test document for the RAG system to verify authentication and upload.")

url = "http://127.0.0.1:8000/upload/"
files = {'file': open('test_doc.txt', 'rb')}

try:
    print(f"Sending upload request to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['file'].close()
    if os.path.exists("test_doc.txt"):
        os.remove("test_doc.txt")
