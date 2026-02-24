import os
import time
from langchain_community.llms import Ollama
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Qdrant
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from database import get_qdrant_client

# Configuration
COLLECTION_NAME = "local_documents"
OLLAMA_MODEL = "llama3.2:1b"

# Global Model Singletons (Initializes only ONCE on startup)
print("--- [RAG] Initializing Embeddings & LLM (Wait for it...) ---")
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
llm = Ollama(
    model=OLLAMA_MODEL,
    temperature=0,
    num_predict=64,
    top_p=0.9
)
print("--- [RAG] Models Loaded and Ready ---")

def get_rag_chain(folder_name: str = None):
    # 2. Vector Store - Use Singleton
    client = get_qdrant_client()
    vector_store = Qdrant(
        client=client, 
        collection_name=COLLECTION_NAME, 
        embeddings=embeddings
    )
    
    search_kwargs = {"k": 3}
    if folder_name and folder_name != "All":
        print(f"--- [RAG] Filtering by folder: {folder_name} ---")
        search_kwargs["filter"] = {"folder": folder_name}
    
    # Increase k for better context
    retriever = vector_store.as_retriever(search_kwargs=search_kwargs)
    
    # 4. Prompt
    template = """You are a STRICT document-grounded assistant.

Your knowledge is LIMITED to the provided CONTEXT only.
The CONTEXT may contain OCR text and may include noise.

════════════════════════════════════
ABSOLUTE RULES (NON-NEGOTIABLE)
════════════════════════════════════
1. Use ONLY information explicitly present in the CONTEXT.
2. NEVER use prior knowledge, assumptions, or inference.
3. NEVER guess or complete missing information.
4. Use values from ONE clearly identifiable document, page, and company only.
5. If more than one company, invoice, or document appears → respond EXACTLY:
   Query not found in document.
6. If ANY requested value is missing, unclear, or not explicitly written → respond EXACTLY:
   Query not found in document.
7. Perform calculations ONLY if explicitly requested and all values are present.

════════════════════════════════════
QUESTION TYPE HANDLING (MANDATORY)
════════════════════════════════════
A. FACT QUESTIONS
- Extract ONLY the exact value(s) explicitly written in the CONTEXT.

B. MULTI-FIELD QUESTIONS
- Identify EACH requested field.
- Extract ALL values from the SAME document/page.
- If even ONE value is missing → STOP and respond:
  Query not found in document.

C. VALIDATION QUESTIONS (e.g., “Is this correct?”)
- If the statement is fully correct → respond EXACTLY:
  ✅ Correct
- If the statement is incorrect → respond EXACTLY:
  ❌ Not correct
- After ❌ Not correct, output ONLY the correct value(s) from the document.
- Do NOT add explanations.

════════════════════════════════════
ANSWER FORMAT (MANDATORY)
════════════════════════════════════
- Output ONE single line only.
- No explanations, reasoning, labels, or headings.
- Do NOT restate the question.
- Combine multiple values using commas.
- Preserve original formatting (dates, currency symbols).

════════════════════════════════════

CONTEXT:
{context}

USER QUESTION:
{question}
"""
    
    prompt = PromptTemplate.from_template(template)
    
    # 5. Chain with LCEL
    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    rag_chain = (
        {"context": RunnablePassthrough(), "question": RunnablePassthrough()} 
        | prompt
        | llm
        | StrOutputParser()
    )
    
    return retriever, rag_chain

def query_rag(question: str, folder_name: str = None):
    print("\n" + "🚀 " + "="*50)
    print(f"--- [RAG] NEW USER QUERY RECEIVED ---")
    print(f"--- [QUESTION]: {question}")
    print("="*50)
    
    start_time = time.time()
    
    # STEP 1: RETRIEVAL
    print(f"\n🔍 [STEP 1/4]: Searching document database for relevant sections...")
    
    retriever, chain = get_rag_chain(folder_name)
    
    try:
        docs = retriever.invoke(question)
        print(f"--- [RAG] Retrieved {len(docs)} chunks ---")
        
        if not docs:
            print(f"❌ [RAG] No documents found. Aborting generation.")
            return "Data not found in document."
            
        import re
        # Print the fully retrieved data to the terminal in Key: Value format
        for i, doc in enumerate(docs):
            print(f"\n" + "═"*70)
            print(f"📄 [RAG] CHUNK {i+1} FULL DATA")
            print("═"*70)
            
            # Use regex to find capitalized words/phrases followed by values (numbers, dates, emails, lowercase text)
            text = doc.page_content.strip()
            # This regex looks for [Capitalized Words optionally followed by punctuation] space [Value]
            # Since the OCR text is messy, this is a heuristic to separate fields
            pairs = re.findall(r'([A-Z][A-Za-z\s]+?)\s+([A-Za-z0-9@\.\-\#\,]+(?:\s+[A-Za-z0-9@\.\-\#\,]+)*)(?=\s+[A-Z]|$)', text)
            
            if pairs:
                for key, value in pairs:
                    # Clean up
                    k = key.strip()
                    v = value.strip()
                    if len(k) > 1 and len(v) > 0 and k.lower() != v.lower():
                        print(f"{k.ljust(25)} : {v}")
                        print() # Add the requested space and gap between lines
            else:
                # Fallback if the regex fails to find neat pairs
                words = text.split()
                # Print in pairs just to break it up
                for j in range(0, len(words), 2):
                    if j+1 < len(words):
                        print(f"{words[j].ljust(25)} : {words[j+1]}")
                        print() # Add the requested space and gap between lines
                    else:
                        print(f"{words[j].ljust(25)} :")
                        print() # Add the requested space and gap between lines
            
            print("═"*70 + "\n")
        context_str = "\n\n".join(doc.page_content for doc in docs)
        
    except Exception as e:
        print(f"❌ [RAG ERROR] Retrieval failed: {e}")
        return "Error accessing document database."

    # STEP 2: GENERATION
    print(f"🧠 [STEP 2/4]: Found relevant info. Thinking & formulating response...")
    
    try:
        # Pass context and question explicitly
        result = chain.invoke({"context": context_str, "question": question})
    except Exception as e:
        error_msg = str(e)
        if "model requires more system memory" in error_msg:
             print(f"❌ [RAG ERROR]: OOM Error: {error_msg}")
             return (
                 "I apologize, but I cannot answer your question right now because the AI model "
                 "is too large for the available system memory. \n\n"
                 "Please try switching to a smaller model or close other applications to free up RAM."
             )
        raise e
    
    end_time = time.time()
    total_time = end_time - start_time
    
    # STEP 3 & 4: SUCCESS
    print(f"✨ [STEP 3/4]: Response formulated successfully.")
    print(f"📝 [STEP 4/4]: Final Answer generated in {total_time:.2f}s.")
    
    print("\n" + "🤖 " + "-"*50)
    print(f"--- [RAG] BOT REPLY ---")
    print(f"{result}")
    print("-"*50 + "\n")
    return result
