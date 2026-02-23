import langchain_community
try:
    from langchain_community.chains import RetrievalQA
    print("SUCCESS: RetrievalQA found in langchain_community.chains")
except ImportError:
    print("RetrievalQA NOT found in langchain_community.chains")

try:
    import langchain.chains
except ImportError:
    print("langchain.chains still failing")
