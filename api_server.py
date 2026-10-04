"""
api_server.py — Self-contained Flask API server for the YouTube Tutor chatbot.

Endpoints:
  POST /api/process-video  { "url": "<youtube_url>" }
  POST /api/ask-question   { "question": "<user_question>" }

LangChain / FAISS logic is embedded here directly (no separate app.py needed).
"""

import re
from dotenv import load_dotenv

from flask import Flask, request, jsonify
from flask_cors import CORS

from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
import os
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled

load_dotenv()

# ── Flask setup ────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def home():
    return jsonify({"status": "YouTube Chatbot API is running and ready!"}), 200


# ── Global in-memory state ─────────────────────────────────────────────────────
_vector_store: FAISS | None = None
_retriever = None


# ── LangChain helpers ──────────────────────────────────────────────────────────

def _extract_video_id(url: str) -> str:
    """Extract the YouTube video ID from a variety of URL formats."""
    pattern = r"(?:v=|/v/|youtu\.be/|/embed/|/shorts/)([A-Za-z0-9_-]{11})"
    match = re.search(pattern, url)
    if match:
        return match.group(1)
    raise ValueError(f"Could not extract video ID from URL: {url}")


def _format_docs(docs) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


def process_video(url: str) -> str:
    """
    Download the YouTube transcript, chunk it, embed it, and store it in FAISS.
    Returns a human-readable success message. Raises on any error.
    """
    global _vector_store, _retriever

    video_id = _extract_video_id(url)

    try:
        transcript_list = YouTubeTranscriptApi().fetch(video_id)
    except (NoTranscriptFound, TranscriptsDisabled) as exc:
        raise RuntimeError(
            "No English transcript available for this video. "
            "Please try a video with captions enabled."
        ) from exc

    full_text = " ".join([getattr(item, 'text', '') if not isinstance(item, dict) else item.get('text', '') for item in transcript_list])

    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.create_documents([full_text])

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    _vector_store = FAISS.from_documents(docs, embeddings)
    _retriever = _vector_store.as_retriever(search_kwargs={"k": 4})

    return f"Transcript processed successfully ({len(docs)} chunks indexed)."


def ask_question(question: str) -> dict:
    """
    Answer a question about the currently loaded video.
    Returns: {"answer": str, "follow_ups": list[str]}
    Raises RuntimeError if no video has been processed yet.
    """
    if _retriever is None:
        raise RuntimeError("No video has been processed yet. Please submit a YouTube URL first.")

    prompt = PromptTemplate.from_template(
        "You are a helpful, easy-to-understand AI tutor.\n"
        "Use the following transcript excerpts to answer the question.\n"
        "If the answer is not in the transcript, say so clearly.\n\n"
        "STRICT FORMATTING RULES:\n"
        "1. NEVER use LaTeX, math blocks, or special mathematical formatting symbols like \\(, \\), \\[, or \\].\n"
        "2. Write all math equations in plain text (e.g., y = mx + b).\n"
        "3. Always structure your answers using clear, line-by-line bullet points.\n"
        "4. Keep paragraphs extremely short and use simple, everyday English.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    )

    llm = ChatGroq(
        temperature=0,
        model_name="openai/gpt-oss-20b",
        groq_api_key=os.getenv("GROQ_API_KEY")
    )

    chain = (
        {"context": _retriever | _format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    answer = chain.invoke(question)
    follow_ups = _generate_follow_ups(question, answer, llm)
    return {"answer": answer, "follow_ups": follow_ups}


def _generate_follow_ups(question: str, answer: str, llm: ChatGroq) -> list[str]:
    """Ask the LLM to suggest 3 concise follow-up questions."""
    try:
        prompt_text = (
            f'A student asked: "{question}"\n'
            f'The answer was: "{answer}"\n\n'
            "Generate exactly 3 short follow-up questions the student might ask next. "
            "Return only the questions, one per line, without numbering or bullet points."
        )
        result = llm.invoke(prompt_text).content
        lines = [line.strip() for line in result.strip().splitlines() if line.strip()]
        return lines[:3]
    except Exception:
        return []


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/api/process-video", methods=["POST"])
def route_process_video():
    data = request.get_json(silent=True) or {}
    url = (data.get("url") or "").strip()

    if not url:
        return jsonify({"error": "Missing 'url' field in request body."}), 400

    try:
        message = process_video(url)
        return jsonify({"message": message}), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 422
    except Exception as exc:
        return jsonify({"error": f"Unexpected error: {exc}"}), 500


@app.route("/api/ask-question", methods=["POST"])
def route_ask_question():
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({"error": "Missing 'question' field in request body."}), 400

    try:
        result = ask_question(question)
        return jsonify(result), 200
    except RuntimeError as exc:
        return jsonify({"error": str(exc)}), 422
    except Exception as exc:
        return jsonify({"error": f"Unexpected error: {exc}"}), 500


if __name__ == "__main__":
    print("YouTube Tutor API running on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)
