try:
    from langchain_core.runnables import RunnablePassthrough
    from langchain_core.output_parsers import StrOutputParser
    from langchain_core.prompts import PromptTemplate
    print("SUCCESS: LCEL components found.")
except ImportError as e:
    print(f"FAILURE: LCEL components missing: {e}")

try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
    print("SUCCESS: RecursiveCharacterTextSplitter found.")
except ImportError as e:
    print(f"FAILURE: RecursiveCharacterTextSplitter missing: {e}")
