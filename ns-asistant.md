# Network School Voice Assistant

## Architecture & Technical Specification

**Version:** 1.0  
**Date:** January 2026  
**Event:** Gemini 3 Hackathon Qualifier (Network School)

---

## 1. Executive Summary

### 1.1 What Is This Project?

Network School Voice Assistant is an AI-powered conversational interface that provides instant, accurate answers about everything related to Network School. Users interact via natural speech—asking questions about events, community members, guidelines, and discussions—and receive spoken responses grounded in real community data.

### 1.2 The Problem

| Pain Point | Impact |
|------------|--------|
| Information scattered across Discord, Notion, and Luma | New members struggle to find answers |
| No single source of truth | Repeated questions in Discord channels |
| Time zone differences | Can't always get answers from community members |
| Onboarding friction | Takes days/weeks to understand NS culture and norms |
| Event discovery | People miss relevant events buried in announcements |

### 1.3 The Solution

A voice-first AI assistant that:

- **Knows NS deeply** — trained on Discord history, Notion docs, and Luma events
- **Speaks naturally** — voice input and output for conversational interaction
- **Answers accurately** — RAG ensures responses are grounded in real data, not hallucinations
- **Available 24/7** — no time zone limitations
- **Learns continuously** — data pipeline can be refreshed as community evolves

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER INTERFACE                                │
│                                                                         │
│    ┌─────────────┐         ┌─────────────┐         ┌─────────────┐     │
│    │   Web App   │         │   Mobile    │         │  Kiosk Mode │     │
│    │  (Primary)  │         │  (Future)   │         │  (Demo Day) │     │
│    └──────┬──────┘         └─────────────┘         └──────┬──────┘     │
│           │                                                │            │
│           └────────────────────┬───────────────────────────┘            │
│                                ▼                                        │
│    ┌───────────────────────────────────────────────────────────────┐   │
│    │                    VOICE INTERFACE LAYER                       │   │
│    │                                                                │   │
│    │   🎤 Speech-to-Text              🔊 Text-to-Speech            │   │
│    │   (Web Speech API or             (Web Speech API or           │   │
│    │    Gemini Audio)                  Gemini Audio)               │   │
│    └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                               │
│                                                                         │
│    ┌───────────────────────────────────────────────────────────────┐   │
│    │                      QUERY PROCESSOR                           │   │
│    │                                                                │   │
│    │   • Intent classification (event query, people, FAQ, etc.)    │   │
│    │   • Query preprocessing and normalization                      │   │
│    │   • Context management (conversation history)                  │   │
│    └───────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│    ┌───────────────────────────────────────────────────────────────┐   │
│    │                      RAG ORCHESTRATOR                          │   │
│    │                                                                │   │
│    │   1. Embed user query using Gemini Embedding API              │   │
│    │   2. Search vector database for relevant chunks               │   │
│    │   3. Retrieve top-k most similar documents                    │   │
│    │   4. Construct prompt with retrieved context                   │   │
│    │   5. Send to Gemini API for generation                        │   │
│    │   6. Post-process and validate response                       │   │
│    └───────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    ▼                                    │
│    ┌───────────────────────────────────────────────────────────────┐   │
│    │                    GEMINI API INTEGRATION                      │   │
│    │                                                                │   │
│    │   Model: gemini-2.0-flash or gemini-1.5-pro                   │   │
│    │   • Text generation with grounding                            │   │
│    │   • Embedding generation (text-embedding-004)                 │   │
│    │   • Multimodal support (future: image understanding)          │   │
│    └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           DATA LAYER                                    │
│                                                                         │
│    ┌───────────────────────────────────────────────────────────────┐   │
│    │                     VECTOR DATABASE                            │   │
│    │                                                                │   │
│    │   Storage: Chroma / Pinecone / Qdrant / Supabase pgvector     │   │
│    │                                                                │   │
│    │   Collections:                                                 │   │
│    │   ├── discord_messages (chunked conversations)                │   │
│    │   ├── notion_pages (documentation, FAQs, guides)              │   │
│    │   ├── luma_events (past and upcoming events)                  │   │
│    │   └── people_profiles (member info from Discord)              │   │
│    └───────────────────────────────────────────────────────────────┘   │
│                                    ▲                                    │
│                                    │                                    │
│    ┌───────────────────────────────────────────────────────────────┐   │
│    │                  DATA INGESTION PIPELINE                       │   │
│    │                                                                │   │
│    │   ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐   │   │
│    │   │ Discord │    │ Notion  │    │  Luma   │    │ Manual  │   │   │
│    │   │ Export  │    │  API    │    │  API    │    │  Data   │   │   │
│    │   └────┬────┘    └────┬────┘    └────┬────┘    └────┬────┘   │   │
│    │        │              │              │              │         │   │
│    │        └──────────────┴──────────────┴──────────────┘         │   │
│    │                              │                                 │   │
│    │                              ▼                                 │   │
│    │                    ┌─────────────────┐                        │   │
│    │                    │    Chunking &   │                        │   │
│    │                    │    Embedding    │                        │   │
│    │                    └─────────────────┘                        │   │
│    └───────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Diagram

```
USER SPEAKS                                           USER HEARS RESPONSE
     │                                                         ▲
     ▼                                                         │
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Voice  │───▶│  Query  │───▶│ Vector  │───▶│ Gemini  │───▶│  Voice  │
│  Input  │    │ Embed   │    │ Search  │    │ Generate│    │ Output  │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                   │
                                   ▼
                            ┌─────────────┐
                            │  Retrieved  │
                            │   Context   │
                            │  (Top 5-10  │
                            │   chunks)   │
                            └─────────────┘
```

---

## 3. Technology Stack

### 3.1 Core Technologies

| Layer | Technology | Justification |
|-------|------------|---------------|
| **LLM** | Gemini API (gemini-2.0-flash) | Hackathon requirement; fast, capable, multimodal |
| **Embeddings** | Gemini text-embedding-004 | Native integration, high quality |
| **Vector DB** | Chroma (local) or Pinecone (hosted) | Chroma: simple, no setup; Pinecone: production-ready |
| **Backend** | Python + FastAPI | Rapid development, async support, Gemini SDK |
| **Frontend** | Next.js or plain HTML/JS | Quick UI, good voice API support |
| **Voice STT** | Web Speech API or Gemini | Browser-native is fastest to implement |
| **Voice TTS** | Web Speech API or Gemini | Same—browser-native for speed |
| **Hosting** | Vercel (frontend) + Railway/Render (backend) | Free tiers, fast deployment |

### 3.2 Technology Decision Matrix

| Component | Option A (Recommended) | Option B | Option C |
|-----------|----------------------|----------|----------|
| Vector DB | **Chroma** (simplest) | Pinecone (scalable) | Supabase pgvector |
| Backend | **FastAPI** (Python) | Express (Node.js) | Hono (Edge) |
| Frontend | **Next.js** | SvelteKit | Plain HTML/JS |
| Speech-to-Text | **Web Speech API** | Deepgram | Whisper API |
| Text-to-Speech | **Web Speech API** | ElevenLabs | Google TTS |

### 3.3 Python Dependencies

```
# Core
google-generativeai     # Gemini API SDK
chromadb                # Vector database
fastapi                 # API framework
uvicorn                 # ASGI server
python-dotenv           # Environment variables

# Data Processing
langchain               # RAG orchestration (optional)
tiktoken                # Token counting
pandas                  # Data manipulation

# Integrations
discord.py              # Discord data export (if live)
notion-client           # Notion API
requests                # HTTP client for Luma API
```

### 3.4 JavaScript/Frontend Dependencies

```json
{
  "dependencies": {
    "next": "14.x",
    "react": "18.x",
    "@google/generative-ai": "latest"
  }
}
```

---

## 4. Data Sources & Ingestion

### 4.1 Data Sources Overview

| Source | Content Type | Access Method | Priority |
|--------|--------------|---------------|----------|
| **Discord** | Conversations, announcements, introductions | Export JSON or Bot API | High |
| **Notion** | FAQs, guidelines, documentation, member directory | Notion API | High |
| **Luma** | Events (past & upcoming), RSVPs, descriptions | Luma API or scrape | High |
| **Manual** | Curated Q&A, important context | JSON/CSV files | Medium |

### 4.2 Discord Data Strategy

**Channels to Prioritize:**

- #announcements
- #introductions
- #general (filtered for high-signal content)
- #events
- #questions / #help
- Project-specific channels

**Chunking Approach:**

```
┌─────────────────────────────────────────┐
│           DISCORD MESSAGE               │
├─────────────────────────────────────────┤
│ Message ID: 123456789                   │
│ Author: @username                       │
│ Channel: #announcements                 │
│ Timestamp: 2025-01-02T10:30:00Z        │
│ Content: "Tomorrow's event is..."       │
│ Thread/Reply Context: [if applicable]   │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           CHUNKED DOCUMENT              │
├─────────────────────────────────────────┤
│ Metadata:                               │
│   - source: discord                     │
│   - channel: announcements              │
│   - author: username                    │
│   - date: 2025-01-02                   │
│   - type: announcement                  │
│                                         │
│ Content: [message + surrounding context]│
└─────────────────────────────────────────┘
```

**Chunking Parameters:**

- Chunk size: 500-1000 tokens
- Overlap: 100 tokens
- Group related messages (threads, time-proximity)

### 4.3 Notion Data Strategy

**Pages to Include:**

- FAQ documents
- Community guidelines
- Member directory (if public)
- Event recaps
- Project documentation
- Onboarding guides

**Chunking Strategy:**

- Split by headers (H1, H2, H3)
- Preserve hierarchy in metadata
- Keep tables intact where possible

### 4.4 Luma Events Data

**Data Structure:**

```
Event Object:
├── event_id
├── title
├── description
├── start_time
├── end_time
├── location
├── hosts[]
├── status (upcoming/past)
├── rsvp_count
└── tags[]
```

**Temporal Handling:**

- Mark events as "upcoming" or "past"
- Update regularly (or on-demand for demo)
- Include relative time context ("this Sunday", "next week")

---

## 5. RAG Pipeline Design

### 5.1 Retrieval Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAG PIPELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. QUERY PROCESSING                                            │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ User Query: "What events are happening this week?"  │    │
│     │                         │                           │    │
│     │                         ▼                           │    │
│     │ Processed: "network school events week january 2026"│    │
│     │ + Add temporal context (current date)               │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  2. EMBEDDING                                                   │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Gemini text-embedding-004                           │    │
│     │ Output: 768-dimensional vector                      │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  3. RETRIEVAL                                                   │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Vector similarity search (cosine)                   │    │
│     │ Top-k: 5-10 chunks                                  │    │
│     │ Optional: Metadata filtering (source, date, type)   │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  4. CONTEXT CONSTRUCTION                                        │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ Combine retrieved chunks into context window        │    │
│     │ Order by relevance score                            │    │
│     │ Truncate if exceeds token limit                     │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
│  5. GENERATION                                                  │
│     ┌─────────────────────────────────────────────────────┐    │
│     │ System Prompt + Retrieved Context + User Query      │    │
│     │                         │                           │    │
│     │                         ▼                           │    │
│     │              Gemini API (gemini-2.0-flash)          │    │
│     │                         │                           │    │
│     │                         ▼                           │    │
│     │              Grounded, accurate response            │    │
│     └─────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 System Prompt Design

```
You are the Network School Assistant, a helpful and friendly AI 
that answers questions about Network School (NS) — a physical 
community and co-living space.

INSTRUCTIONS:
1. Answer questions based ONLY on the provided context
2. If the context doesn't contain the answer, say "I don't have 
   that information, but you could ask in the Discord"
3. Be conversational and friendly — you're speaking aloud
4. Keep responses concise (2-4 sentences for simple questions)
5. For event questions, always mention the date and location
6. When mentioning people, use their first names naturally

CURRENT DATE: {current_date}

CONTEXT FROM NETWORK SCHOOL DATA:
{retrieved_chunks}

USER QUESTION: {user_query}
```

### 5.3 Handling Edge Cases

| Scenario | Handling Strategy |
|----------|-------------------|
| No relevant results | "I don't have specific info on that. Try asking in Discord!" |
| Multiple interpretations | Ask clarifying question or provide most likely answer |
| Outdated event info | Always check event dates against current date |
| Personal/sensitive info | Don't expose private member details |
| Off-topic questions | Gently redirect to NS-related topics |

---

## 6. Voice Interface Design

### 6.1 Voice Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      VOICE INTERACTION FLOW                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────┐                                                    │
│  │  IDLE   │◀─────────────────────────────────────────────┐    │
│  └────┬────┘                                              │    │
│       │ User clicks mic / says wake word                  │    │
│       ▼                                                   │    │
│  ┌─────────┐                                              │    │
│  │LISTENING│  Visual: pulsing microphone icon            │    │
│  └────┬────┘                                              │    │
│       │ Speech detected → silence detected                │    │
│       ▼                                                   │    │
│  ┌─────────┐                                              │    │
│  │PROCESSING│ Visual: thinking animation                  │    │
│  └────┬────┘                                              │    │
│       │ Transcription complete                            │    │
│       ▼                                                   │    │
│  ┌─────────┐                                              │    │
│  │SEARCHING│  Visual: searching animation                 │    │
│  └────┬────┘                                              │    │
│       │ RAG retrieval + generation complete               │    │
│       ▼                                                   │    │
│  ┌─────────┐                                              │    │
│  │SPEAKING │  Visual: sound wave animation                │    │
│  └────┬────┘                                              │    │
│       │ TTS complete                                      │    │
│       └───────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Voice Technology Options

| Option | Pros | Cons | Best For |
|--------|------|------|----------|
| **Web Speech API** | Zero setup, free, works in Chrome | Browser-only, quality varies | Hackathon (fast) |
| **Gemini Native Audio** | Integrated, potentially higher quality | May require setup | Future enhancement |
| **Deepgram + ElevenLabs** | Professional quality | API costs, more integration | Production |

### 6.3 UI States for Voice

| State | Visual Indicator | Audio Feedback |
|-------|------------------|----------------|
| Ready | Static mic icon | None |
| Listening | Pulsing/glowing mic | Subtle beep |
| Processing | Loading spinner | None |
| Speaking | Sound wave animation | AI voice |
| Error | Red icon | "Sorry, I didn't catch that" |

---

## 7. API Integrations

### 7.1 Gemini API

**Endpoints Used:**

| Endpoint | Purpose |
|----------|---------|
| `generateContent` | Text generation |
| `embedContent` | Text embeddings |
| `countTokens` | Token management |

**Configuration:**

- Model: gemini-2.0-flash (fast) or gemini-1.5-pro (quality)
- Temperature: 0.3 (factual, consistent)
- Max Output Tokens: 256 (concise for voice)
- Safety Settings: Default

### 7.2 Luma API

**Base URL:** `https://api.lu.ma/`

**Key Endpoints:**

- `GET /calendar/{calendar_id}/events` — list events
- `GET /event/{event_id}` — event details

**Alternative:** Scrape public Luma calendar page if API access limited

### 7.3 Notion API

**Authentication:** Integration token (internal)

**Key Operations:**

- Query databases
- Retrieve page content
- Search across workspace

### 7.4 Discord Data

**Options:**

| Method | Pros | Cons |
|--------|------|------|
| **Static Export** | Fast, simple, one-time | Stale data |
| **Bot API** | Real-time access | Requires bot setup |
| **Manual Curation** | High quality | Labor intensive |

**Recommended for Hackathon:** Static export (fastest setup)

---

## 8. Project Structure

```
ns-voice-assistant/
│
├── backend/
│   ├── main.py                 # FastAPI application entry
│   ├── config.py               # Configuration settings
│   ├── requirements.txt        # Python dependencies
│   │
│   ├── api/
│   │   ├── routes.py           # API endpoints
│   │   └── voice.py            # Voice processing endpoints
│   │
│   ├── rag/
│   │   ├── embeddings.py       # Gemini embedding functions
│   │   ├── retrieval.py        # Vector search logic
│   │   ├── generation.py       # Response generation
│   │   └── prompts.py          # System prompts
│   │
│   ├── data/
│   │   ├── loaders/
│   │   │   ├── discord.py      # Discord data loader
│   │   │   ├── notion.py       # Notion data loader
│   │   │   └── luma.py         # Luma events loader
│   │   │
│   │   ├── processors/
│   │   │   ├── chunker.py      # Text chunking logic
│   │   │   └── embedder.py     # Batch embedding
│   │   │
│   │   └── raw/                # Raw exported data
│   │       ├── discord/
│   │       ├── notion/
│   │       └── luma/
│   │
│   └── vectordb/
│       ├── client.py           # Vector DB connection
│       └── collections.py      # Collection management
│
├── frontend/
│   ├── index.html              # Main page
│   ├── styles.css              # Styling
│   ├── app.js                  # Main application logic
│   ├── voice.js                # Voice handling (STT/TTS)
│   └── components/
│       ├── microphone.js       # Mic button component
│       └── transcript.js       # Conversation display
│
├── scripts/
│   ├── ingest_data.py          # One-time data ingestion
│   ├── export_discord.py       # Discord export helper
│   └── test_rag.py             # RAG testing script
│
├── .env.example                # Environment variables template
├── docker-compose.yml          # Local development setup
└── README.md                   # Project documentation
```

---

## 9. Build Timeline

### 9.1 Pre-Event Preparation (Saturday)

| Duration | Task | Deliverable |
|----------|------|-------------|
| 2 hrs | Export Discord data (key channels) | JSON files |
| 1 hr | Export/download Notion pages | Markdown/JSON |
| 1 hr | Fetch Luma events via API | JSON file |
| 1 hr | Set up project repo, environment | Working dev setup |

### 9.2 Build Day (Sunday)

| Time Block | Duration | Focus | Deliverable |
|------------|----------|-------|-------------|
| Morning | 2 hrs | Data processing: chunking + embedding | Populated vector DB |
| Late Morning | 2 hrs | RAG pipeline: retrieval + generation | Working Q&A (text) |
| Afternoon | 2 hrs | Voice integration: STT + TTS | Voice working |
| Late Afternoon | 1 hr | UI polish and edge cases | Presentable interface |
| Evening | 1 hr | Demo prep and testing | Rehearsed demo |

### 9.3 Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Data export takes too long | Pre-export Saturday; have backup curated dataset |
| Vector DB issues | Use Chroma in-memory as fallback |
| Voice API unreliable | Have text input fallback |
| Gemini API rate limits | Cache common queries; use flash model |

---

## 10. Demo Strategy

### 10.1 Demo Script (3-5 minutes)

**Opening (30 sec):**
> "Every NS member has asked 'What events are happening?' or 'Who should I talk to about X?' Let me show you an easier way..."

**Demo Questions to Showcase:**

| Category | Sample Question |
|----------|-----------------|
| Events | "What events are happening this week?" |
| People | "Who in NS is working on AI projects?" |
| Practical | "What's the wifi password?" |
| Community | "What did Balaji talk about in his last session?" |
| Meta | "What is Network School?" |

**Closing (30 sec):**
> "Available 24/7, knows everything about NS, and speaks your language. Built in one day with Gemini API."

### 10.2 Demo Checklist

- [ ] Stable internet connection
- [ ] Microphone tested and working
- [ ] 5-6 pre-tested questions that work well
- [ ] Text fallback ready if voice fails
- [ ] Screen visible to audience
- [ ] Backup device available

---

## 11. Environment Variables

```env
# Gemini API
GOOGLE_API_KEY=your_gemini_api_key

# Vector Database (if using Pinecone)
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_environment
PINECONE_INDEX=ns-assistant

# Notion (if using API)
NOTION_API_KEY=your_notion_integration_key

# Luma (if using API)
LUMA_API_KEY=your_luma_key
LUMA_CALENDAR_ID=network_school_calendar

# App Config
ENVIRONMENT=development
DEBUG=true
```

---

## 12. Success Metrics

### 12.1 Hackathon Success (Sunday)

| Metric | Target |
|--------|--------|
| Voice recognition accuracy | >90% of queries understood |
| Response relevance | >80% answers grounded in data |
| Response time | <5 seconds end-to-end |
| Demo completion | All 5 demo questions work |
| Community vote | Top 2 finish |

### 12.2 Future Metrics (Post-Hackathon)

| Metric | Description |
|--------|-------------|
| Daily active users | Track adoption |
| Query success rate | % answered satisfactorily |
| Common failure queries | Identify data gaps |

---

## 13. Future Enhancements

### Phase 2 (Post-Hackathon)

- Real-time Discord sync (live data)
- Multi-language support
- Mobile app version
- Slack integration
- Persistent conversation memory

### Phase 3 (Long-term)

- Agentic actions ("RSVP me to this event")
- Personalization (member-specific answers)
- Analytics dashboard
- Community contribution (members add knowledge)

---

## 14. Sample Test Queries

| Category | Query | Expected Behavior |
|----------|-------|-------------------|
| Events | "What's happening tomorrow?" | Return events with dates/times |
| Events | "Any AI-related events this month?" | Filter by topic |
| People | "Who's interested in Web3?" | Search member interests |
| People | "Who founded Network School?" | Return founder info |
| Practical | "What are the quiet hours?" | Return guidelines |
| Practical | "How do I book a meeting room?" | Return process |
| Community | "What projects is the community working on?" | Summarize activity |
| Meta | "What is Network School about?" | Return overview |

---

## 15. Resources

| Resource | URL |
|----------|-----|
| Gemini API Documentation | https://ai.google.dev/docs |
| Chroma Documentation | https://docs.trychroma.com/ |
| FastAPI Documentation | https://fastapi.tiangolo.com/ |
| Web Speech API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API |
| LangChain RAG Guide | https://python.langchain.com/docs/tutorials/rag/ |

---

**End of Document**

*Good luck at the qualifier! Build something the NS community will love.* 🚀