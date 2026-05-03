# 🤖 AI Agent 

A full-stack, context-aware AI Assistant that solves the "knowledge cutoff" problem using **Retrieval-Augmented Generation (RAG)**. This agent features long-term semantic memory, allowing it to remember past interactions and provide accurate real-time data.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10%2B-green.svg)
![Django](https://img.shields.io/badge/django-6.0-092e20.svg)

---

## 🌟 Key Highlights

- **🧠 Long-Term Memory:** Utilizes a **FAISS Vector Database** to store and retrieve semantic embeddings of past conversations.
- **⚡ High-Performance Inference:** Optimized for low-resource environments (8GB RAM) by leveraging the **Groq LPU (Language Processing Unit)** for sub-second responses.
- **📅 Real-Time Awareness:** Injects dynamic system metadata (Time, Date, Location) into the AI's context window.
- **📟 Terminal UI:** A modern, React-based terminal interface with auto-scroll and markdown support.

---

## 🛠️ Technical Architecture

The system follows a **Retrieval-Augmented Generation (RAG)** workflow:

1. **User Input:** Message is received via a React frontend.
2. **Retrieval:** The Django backend converts the query into an embedding and performs a semantic similarity search in the **FAISS** index.
3. **Augmentation:** Relevant past context and system metadata (Current Time) are combined into a structured system prompt.
4. **Generation:** The augmented prompt is sent to **Llama 3** (via Groq API) for high-speed response generation.
5. **Memory Update:** Both user and AI messages are encoded and stored back in the vector database.



---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js & npm
- [Groq API Key](https://console.groq.com/keys)

### Backend Setup (Django)
1. Clone the repository: `git clone https://github.com/YOUR_USERNAME/ai-agent-terminal.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Add your Groq API Key in `services/agent.py`.
4. Run migrations: `python manage.py migrate`
5. Start server: `python manage.py runserver`

### Frontend Setup (React)
1. Navigate to frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start frontend: `npm run dev`

---

## 📈 Optimization Story

Originally designed to run locally via **Ollama**, the system faced high latency on 8GB RAM hardware. I successfully optimized the architecture by:
- Decoupling the **Embedding Engine** (local) from the **Inference Engine** (cloud).
- Implementing a **FAISS** flat index for lightweight, high-speed local vector retrieval.
- Result: Reduced response latency by **95%** (from ~30s to <1s).

---

## 🧪 Tech Stack
- **Frontend:** React.js, CSS3 (Terminal Aesthetic)
- **Backend:** Django, Django REST Framework (DRF)
- **AI/ML:** Llama 3 (via Groq), Sentence-Transformers (MiniLM-L6-v2), FAISS
- **Tools:** Python, JavaScript, Git

---

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.
