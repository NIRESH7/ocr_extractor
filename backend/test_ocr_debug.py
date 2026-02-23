import sys
print(f"Python Executable: {sys.executable}")
print(f"Sys Path: {sys.path}")

try:
    import rapidocr_onnxruntime
    print(f"RapidOCR module found at: {rapidocr_onnxruntime.__file__}")
    from rapidocr_onnxruntime import RapidOCR
    print("RapidOCR class imported successfully")
except ImportError as e:
    print(f"RapidOCR import failed: {e}")

try:
    import pypdf
    print("pypdf imported successfully")
except ImportError as e:
    print(f"pypdf import failed: {e}")
