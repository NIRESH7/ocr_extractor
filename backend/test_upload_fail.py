import requests
import os

# Create a dummy file with unsupported extension
with open("test_doc.xyz", "w") as f:
    f.write("This should fail.")

url = "http://127.0.0.1:8000/upload/"
files = {'file': open('test_doc.xyz', 'rb')}

try:
    print(f"Sending invalid upload request to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
finally:
    files['file'].close()
    if os.path.exists("test_doc.xyz"):
        os.remove("test_doc.xyz")
