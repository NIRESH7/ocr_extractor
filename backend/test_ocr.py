try:
    from rapidocr_onnxruntime import RapidOCR
    print("RapidOCR imported successfully")
except ImportError as e:
    print(f"RapidOCR import failed: {e}")

try:
    from pypdf import PdfReader
    print("pypdf imported successfully")
except ImportError as e:
    print(f"pypdf import failed: {e}")
