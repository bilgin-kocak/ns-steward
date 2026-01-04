
__import__('pysqlite3')
import sys
sys.modules['sqlite3'] = sys.modules.pop('pysqlite3')

import os
import datetime
from dotenv import load_dotenv
from google import genai
from google.genai import types
from langchain_community.vectorstores import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import chromadb
from chromadb.config import Settings
from fetch_luma_events import fetch_events

# Load environment variables
load_dotenv()

# Configuration
DB_DIR = "./network_school_db"
EMBEDDING_MODEL = "models/text-embedding-004"
GENERATION_MODEL = "gemini-3-flash-preview"

# Initialize Gemini Client (New SDK)
if "GOOGLE_API_KEY" not in os.environ:
    raise ValueError("GOOGLE_API_KEY not found in environment")

client_genai = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])

# Initialize Embeddings (Langchain is fine for this part, or we could use genai)
embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)

# Load Vector Stores
chroma_client = chromadb.PersistentClient(path=DB_DIR, settings=Settings(allow_reset=True))
db_wiki = Chroma(client=chroma_client, embedding_function=embeddings, collection_name="ns_wiki")
db_discord = Chroma(client=chroma_client, embedding_function=embeddings, collection_name="ns_discord")
db_resources = Chroma(client=chroma_client, embedding_function=embeddings, collection_name="ns_resources")

def query_rag(query, collection_name="all"):
    results = []
    if collection_name in ["wiki", "all"]:
        results.extend(db_wiki.similarity_search(query, k=3))
    if collection_name in ["discord", "all"]:
        results.extend(db_discord.similarity_search(query, k=3))
    if collection_name in ["resources", "all"]:
        results.extend(db_resources.similarity_search(query, k=2))
    return results

# Tools Definition for Gemini 3
def search_knowledge_base(query: str):
    """
    Useful for answering questions about Network School rules, logistics, people, locations, and general static info.
    """
    print(f"🔍 Searching Knowledge Base for: {query}")
    results = query_rag(query, "all")
    return "\n\n".join([d.page_content for d in results])

def get_upcoming_events():
    """
    Useful for answering questions about the calendar, schedule, or what is happening soon.
    """
    print("📅 Fetching Live Events...")
    try:
        return str(fetch_events())
    except Exception as e:
        return f"Error fetching events: {e}"

# Tool mapping for the agent loop
TOOLS_MAP = {
    "search_knowledge_base": search_knowledge_base,
    "get_upcoming_events": get_upcoming_events
}

def generate_answer(query):
    # Calculate Singapore Time
    utc_now = datetime.datetime.now(datetime.timezone.utc)
    sgt_now = utc_now + datetime.timedelta(hours=8)
    formatted_date = sgt_now.strftime("%A, %B %d, %Y")
    formatted_time = sgt_now.strftime("%I:%M %p SGT")

    system_message = f"""
    You are NS Steward, the premium AI concierge for the Network School.
    Current Time: {formatted_time} ({formatted_date}).
    
    You have tools to find real-time info:
    - Use 'get_upcoming_events' for calendar/schedule.
    - Use 'search_knowledge_base' for locations, rules, and school info.
    
    Be friendly, concise, and professional. Always embody the "Society as a Service" ethos.
    """

    # NEW GOOGLE-GENAI SDK CALL WITH AUTOMATIC TOOL HANDLING
    print(f"🧠 Processing Query with Gemini 3: {query}")
    
    # We use a chat session with automatic_function_calling=True
    # This automatically executes the tools and handles thought signatures
    chat = client_genai.chats.create(
        model=GENERATION_MODEL,
        config=types.GenerateContentConfig(
            system_instruction=system_message,
            tools=[search_knowledge_base, get_upcoming_events],
            automatic_function_calling=types.AutomaticFunctionCallingConfig()
        )
    )
    
    response = chat.send_message(query)
    return response.text

if __name__ == "__main__":
    print("\n👋 Network School Agent (Gemini 3) Ready!\n")
    while True:
        user_input = input("You: ")
        if user_input.lower() in ['quit', 'exit']:
            break
        try:
            response = generate_answer(user_input)
            print(f"NS Bot: {response}\n")
        except Exception as e:
            print(f"Error: {e}")
