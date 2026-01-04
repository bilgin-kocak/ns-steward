# 🏛️ NS Steward | SocietyOS

**NS Steward** is a premium, voice-first AI concierge designed for the **Network School** (NS). Powered by **Gemini 3.0**, it serves as the "Operating System" for the startup society, bridging the gap between digital community knowledge and physical campus experience.

---

## 🚀 Vision: Society as a Service
In a startup society, knowledge is the most valuable asset. NS Steward centralizes this knowledge—from orientation documents and Discord discussions to real-time event schedules—and makes it accessible via a high-fidelity, multimodal interface.

## ✨ Key Features
- **🎤 Voice-First Interface**: Low-latency Speech-to-Text (STT) and neural Text-to-Speech (TTS) for a seamless "Star Trek" computer experience.
- **🧠 Gemini 3 Intelligence**: Leverages the official `google-genai` SDK for tool-calling, automatic function execution, and reasoning.
- **📚 Deep RAG (Retrieval Augmented Generation)**:
    - **Wiki**: Full indexing of NS orientation, rules, and logistics.
    - **Discord**: Real-time context from announcements and community discussions.
    - **Resources**: Ingestion of dense PDF course materials and guidelines.
- **📅 Live Event Integration**: Real-time tool-calling to fetch the latest schedule via the Luma API.
- **💎 Premium UI**: A stunning 3D-inspired iridescent orb interface built with Next.js, Framer Motion, and Tailwind CSS.

---

## 🛠️ Technology Stack
- **AI Core**: Gemini 3.0 Flash Preview (`gemini-3-flash-preview`)
- **SDK**: Official Google GenAI Python SDK
- **Backend**: FastAPI (Python)
- **Vector Database**: ChromaDB (with `pysqlite3` binary patch)
- **Frontend**: Next.js 15 (React 19), Framer Motion, Tailwind CSS
- **Voice**: Web Speech API (Native)
- **Deployment**: Railway (Backend), Vercel (Frontend)

---

## 📦 Project Structure
```bash
.
├── agent.py            # The Brain: Gemini 3 logic & Tool definitions
├── main.py             # FastAPI Server & Chat Endpoints
├── ingest_data.py      # Data Pipeline: Markdown & PDF ingestion
├── fetch_luma_events.py # Real-time Event Tool
├── ns-documents/       # Source materials (Wiki, Discord, PDFs)
└── frontend/           # Next.js Application
```

---

## ⚙️ Setup & Installation

### 1. Backend Setup
```bash
# Clone the repository
git clone [your-repo-url]
cd [repo-name]

# Install dependencies
pip install -r requirements.txt

# Set up environment variables (.env)
GOOGLE_API_KEY=your_gemini_api_key

# Ingest the knowledge base
python ingest_data.py

# Run the server
python main.py
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

---

## 🗺️ Roadmap
- **Recursive Memory**: Long-term and short-term profiles for NS team members and students.
- **Spatial Intelligence**: AR Vision for campus navigation and physical flyer recognition.
- **Discord Bot**: A native @NS_Steward presence in the community hub.
- **Technical Tutor**: Deep-level curriculum grounding for "Vibe Coding" and technical courses.

---

## 🏆 Hackathon Submission
Developed for the **Gemini 3.0 Hackathon (2026)**.
"Frontier, not fancy." 🏹
