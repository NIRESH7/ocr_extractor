import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), "backend"))

from ingestion import ingest_file

def verify_failure_handling():
    print("--- [VERIFY] Testing Graceful Failure Handling ---")
    
    # Create a dummy unsupported file
    test_file = "test_failure.unknown"
    with open(test_file, "w") as f:
        f.write("Some dummy content")

    print(f"--- [VERIFY] Attempting to ingest: {test_file} ---")
    
    try:
        result = ingest_file(test_file, folder_name="test_folder")
        print(f"--- [VERIFY] Result: {result} ---")
        
        if "error" in result:
            print("--- [VERIFY] SUCCESS: System caught the error gracefully. ---")
        else:
            print("--- [VERIFY] FAILURE: System did not return an error for unsupported file. ---")
            
    except Exception as e:
        print(f"--- [VERIFY] CRITICAL FAILURE: System crashed! {e} ---")
    finally:
        if os.path.exists(test_file):
            os.remove(test_file)

if __name__ == "__main__":
    verify_failure_handling()
