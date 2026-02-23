from qdrant_client import QdrantClient
import os


# Using local persistent storage for a truly local-first setup
QDRANT_PATH = "qdrant_db"

_client_instance = None

def get_qdrant_client():
    global _client_instance
    if _client_instance is None:
        print(f"--- [DB] Initializing QdrantClient with local path: {QDRANT_PATH} ---")
        _client_instance = QdrantClient(path=QDRANT_PATH)
    return _client_instance
