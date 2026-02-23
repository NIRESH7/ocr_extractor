import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))
from database import get_qdrant_client
from qdrant_client.http import models

def verify():
    print("--- Verifying External Qdrant Connection ---")
    try:
        client = get_qdrant_client()
        collections = client.get_collections()
        print(f"Success! Connected to Qdrant.")
        print(f"Collections: {[c.name for c in collections.collections]}")
        
        # Check if 'local_documents' exists
        exists = any(c.name == "local_documents" for c in collections.collections)
        if exists:
            print("Collection 'local_documents' found.")
            count = client.count(collection_name="local_documents").count
            print(f"Vector count: {count}")
        else:
            print("Collection 'local_documents' NOT found (Normal if new).")
            
    except Exception as e:
        print(f"FAILED: {e}")
        print("Make sure Qdrant is running: docker run -p 6333:6333 qdrant/qdrant")

if __name__ == "__main__":
    verify()
