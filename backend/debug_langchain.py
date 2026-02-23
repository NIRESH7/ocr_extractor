import langchain
import os

print(f"Langchain file: {langchain.__file__}")
print(f"Langchain dir: {os.path.dirname(langchain.__file__)}")

try:
    import langchain.chains
    print("langchain.chains exists")
    print(dir(langchain.chains))
except ImportError as e:
    print(f"langchain.chains ImportError: {e}")

try:
    from langchain.chains import RetrievalQA
    print("RetrievalQA found")
except ImportError:
    print("RetrievalQA NOT found in langchain.chains")

# Check for community
try:
    import langchain_community
    print(f"langchain_community file: {langchain_community.__file__}")
except ImportError:
    print("langchain_community NOT found")
