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
    template = """You are a STRICT document-based assistant.

Your knowledge is LIMITED to the provided CONTEXT only.
The CONTEXT may contain text extracted from documents or images.

════════════════════════════════════
ABSOLUTE RULES (NON-NEGOTIABLE)
════════════════════════════════════
1. Answer ALL parts of the USER QUESTION exactly as asked.
2. Use ONLY information explicitly written in the CONTEXT.
3. NEVER assume, infer, guess, or add extra details.
4. NEVER use external knowledge.
5. Perform calculations ONLY if explicitly requested.
6. If ANY requested field is missing, unclear, or not found, respond EXACTLY:
   Query not found in document.

════════════════════════════════════
MULTI-FIELD QUESTION HANDLING (MANDATORY)
════════════════════════════════════
- If the USER QUESTION asks for multiple values (e.g., name, value, GST):
  - Identify EACH requested field.
  - Extract EACH value independently from the SAME document/page.
  - If all values are found, include ALL of them in the answer.
  - If even ONE value is missing → STOP and respond:
    Query not found in document.

════════════════════════════════════
DOCUMENT / PAGE ISOLATION
════════════════════════════════════
- Use values ONLY from ONE clearly identifiable document/page/entity.
- If the source cannot be uniquely identified → STOP.

════════════════════════════════════
ANSWER STYLE (MANDATORY)
════════════════════════════════════
- Respond in ONE complete professional sentence.
- Combine multiple values using commas.
- Do NOT use bullet points, labels, headings, or explanations.
- Do NOT restate the question.
- Do NOT include reasoning.
- Use neutral, formal business language.

════════════════════════════════════
FOR ANSWER VALIDATION ("IS THIS CORRECT?")
════════════════════════════════════
- Respond with ONLY:
  ✅ Correct
  or
  ❌ Not correct
- If ❌ Not correct, output ONLY the correct value from the document.
- Do NOT explain.

════════════════════════════════════
OUTPUT FORMAT (MANDATORY)
════════════════════════════════════
- Output ONLY the final sentence.
- No extra text.

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
            
        for i, doc in enumerate(docs):
            print(f"--- [RAG] Chunk {i+1} Preview (100 chars): {doc.page_content[:100].replace('\\n', ' ')}... ---")
            
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
