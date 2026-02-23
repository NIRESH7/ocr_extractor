import warnings
import sys

# Capture warnings
with warnings.catch_warnings(record=True) as w:
    warnings.simplefilter("always")
    import pydantic
    import langchain
    import langchain_community
    
    print(f"Pydantic Version: {pydantic.VERSION}")
    print(f"Langchain Version: {langchain.__version__}")
    
    try:
        from rag import get_rag_chain
        print("SUCCESS: rag.py imported successfully.")
    except ImportError as e:
        print(f"FAILURE: Could not import rag.py: {e}")
        found_warning = True

    found_warning = False
    for warning in w:
        if "Core Pydantic V1 functionality isn't compatible with Python 3.14" in str(warning.message):
            found_warning = True
            print("FAILURE: Pydantic V1 warning detected!")
    
    if not found_warning:
        print("SUCCESS: No Pydantic V1 compatibility warnings detected.")
