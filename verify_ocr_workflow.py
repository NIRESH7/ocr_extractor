import os
import sys

# Add backend to path and current dir
sys.path.append(os.path.join(os.getcwd(), "backend"))
sys.path.append(os.getcwd())

from ingestion import extract_text_with_ocr
from langchain_core.documents import Document

def verify_ocr():
    print("--- [VERIFY] Starting OCR Workflow Verification ---")
    
    # 1. Identify a PDF to test
    test_pdf = "backend/uploads/hand writing invoice.pdf" 
    if not os.path.exists(test_pdf):
        print(f"--- [VERIFY] Test PDF {test_pdf} NOT FOUND. ---")
        return

    print(f"--- [VERIFY] Testing OCR on: {test_pdf} ---")
    
    try:
        # We call the OCR function directly
        # Note: synthetic_data_1000.pdf might have text, but extract_text_with_ocr 
        # specifically looks for images.
        docs = extract_text_with_ocr(test_pdf)
        
        print(f"--- [VERIFY] Results: {len(docs)} pages with extracted text ---")
        for i, doc in enumerate(docs):
            safe_preview = doc.page_content[:100].encode('ascii', 'ignore').decode('ascii')
            print(f"  Page {i+1} preview: {safe_preview}...")
            
        if len(docs) > 0:
            print("--- [VERIFY] SUCCESS: OCR extracted some text. ---")
        else:
            print("--- [VERIFY] INFO: No text extracted (this is expected if PDF has no images). ---")
            
    except Exception as e:
        print(f"--- [VERIFY] CRITICAL FAILURE: {e} ---")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_ocr()
