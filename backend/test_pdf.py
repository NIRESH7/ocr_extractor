import os
from langchain_community.document_loaders import PyPDFLoader

# Find the first PDF in uploads
upload_dir = "uploads"
files = [f for f in os.listdir(upload_dir) if f.lower().endswith(".pdf")]

if not files:
    print("No PDF found in uploads")
else:
    file_path = os.path.join(upload_dir, files[0])
    print(f"Testing extraction for: {file_path}")
    try:
        loader = PyPDFLoader(file_path)
        docs = loader.load()
        print(f"Extraction Success! Number of pages: {len(docs)}")
        if len(docs) > 0:
            print(f"First 500 chars of page 1:\n{docs[0].page_content[:500]}")
    except Exception as e:
        print(f"Extraction Failed: {e}")
