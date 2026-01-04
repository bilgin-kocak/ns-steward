
import os
import glob
from langchain_community.document_loaders import TextLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter, MarkdownHeaderTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

# Configuration
DB_DIR = "./network_school_db"
EMBEDDING_MODEL = "models/text-embedding-004"

def get_embeddings():
    if "GOOGLE_API_KEY" not in os.environ:
        print("WARNING: GOOGLE_API_KEY not found. Embeddings will fail.")
    return GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)

def ingest_wiki():
    print("\n--- Ingesting Wiki ---")
    files = glob.glob("ns-documents/wiki/*.md")
    all_docs = []
    
    # 1. Split by Headers (Logical sections)
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
    
    # 2. Split large sections further
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    for f in files:
        try:
            with open(f, 'r') as file:
                text = file.read()
                
            # Split by header logic
            md_docs = markdown_splitter.split_text(text)
            for doc in md_docs:
                doc.metadata["source"] = f
                doc.metadata["category"] = "wiki"
            
            # Split by character limit
            docs = text_splitter.split_documents(md_docs)
            all_docs.extend(docs)
            print(f"Processed {f}: {len(docs)} chunks")
        except Exception as e:
            print(f"Error processing {f}: {e}")
            
    if all_docs:
        Chroma.from_documents(
            documents=all_docs,
            embedding=get_embeddings(),
            persist_directory=DB_DIR,
            collection_name="ns_wiki"
        )
        print(f"✅ Success: Added {len(all_docs)} wiki chunks to 'ns_wiki'.")
    else:
        print("No wiki documents found.")

def ingest_discord():
    print("\n--- Ingesting Discord ---")
    files = glob.glob("ns-documents/discord-channels/*.md")
    all_docs = []
    
    # Discord content is conversational. Larger chunks preserve context.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500, 
        chunk_overlap=300,
        separators=["\n\n", "\n", " ", ""]
    )

    for f in files:
        try:
            loader = TextLoader(f)
            docs = loader.load_and_split(text_splitter)
            for doc in docs:
                doc.metadata["category"] = "discord"
            all_docs.extend(docs)
            print(f"Processed {f}: {len(docs)} chunks")
        except Exception as e:
            print(f"Error processing {f}: {e}")

    if all_docs:
        Chroma.from_documents(
            documents=all_docs,
            embedding=get_embeddings(),
            persist_directory=DB_DIR,
            collection_name="ns_discord"
        )
        print(f"✅ Success: Added {len(all_docs)} discord chunks to 'ns_discord'.")
    else:
        print("No discord documents found.")

def ingest_resources():
    print("\n--- Ingesting PDF Resources ---")
    files = glob.glob("ns-documents/*.pdf")
    all_docs = []
    
    # PDFs can be dense.
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)

    for f in files:
        try:
            loader = PyPDFLoader(f)
            docs = loader.load_and_split(text_splitter)
            for doc in docs:
                doc.metadata["source"] = f
                doc.metadata["category"] = "pdf"
            all_docs.extend(docs)
            print(f"Processed {f}: {len(docs)} chunks")
        except Exception as e:
            print(f"Error processing {f}: {e}")

    if all_docs:
        Chroma.from_documents(
            documents=all_docs,
            embedding=get_embeddings(),
            persist_directory=DB_DIR,
            collection_name="ns_resources"
        )
        print(f"✅ Success: Added {len(all_docs)} PDF chunks to 'ns_resources'.")
    else:
        print("No PDF resources found.")

if __name__ == "__main__":
    if "GOOGLE_API_KEY" in os.environ:
        ingest_wiki()
        ingest_discord()
        ingest_resources()
        print("\n🎉 Ingestion Complete.")
    else:
        print("❌ Error: GOOGLE_API_KEY is missing. Please set it in your .env file or environment.")
