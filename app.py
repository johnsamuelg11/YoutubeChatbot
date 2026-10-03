"""
app.py — Core LangChain logic for the YouTube Tutor chatbot.

Responsibilities:
  - Fetch YouTube transcript via youtube-transcript-api
  - Split text into chunks and embed with OpenAI
  - Build a FAISS vector store in memory
  - Answer questions using a modern LCEL retrieval pipeline
  - Generate follow-up questions
"""

import os
import re
from dotenv import load_dotenv

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, TranscriptsDisabled

load_dotenv()

# ── Global in-memory state ─────────────────────────────────────────────────────
_vector_store: FAISS | None = None
_retriever = None


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

    Returns a human-readable success message.
    Raises on any error.
    """
    global _vector_store, _retriever

    video_id = _extract_video_id(url)

    # Fetch transcript
    try:
        transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    except (NoTranscriptFound, TranscriptsDisabled) as exc:
        raise RuntimeError(
            "No English transcript available for this video. "
            "Please try a video with captions enabled."
        ) from exc

    full_text = " ".join(chunk["text"] for chunk in transcript_list)

    # Split into overlapping chunks
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    docs = splitter.create_documents([full_text])

    # Embed and store
    embeddings = OpenAIEmbeddings()
    _vector_store = FAISS.from_documents(docs, embeddings)
    _retriever = _vector_store.as_retriever(search_kwargs={"k": 4})

    return f"Transcript processed successfully ({len(docs)} chunks indexed)."


def ask_question(question: str) -> dict:
    """
    Answer a question about the currently loaded video.

    Returns:
        {"answer": str, "follow_ups": list[str]}
    Raises RuntimeError if no video has been processed yet.
    """
    if _retriever is None:
        raise RuntimeError("No video has been processed yet. Please submit a YouTube URL first.")

    prompt = PromptTemplate.from_template(
        "You are an expert tutor helping a student understand a YouTube video.\n"
        "Use the following transcript excerpts to answer the question.\n"
        "If the answer is not in the transcript, say so clearly.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Answer:"
    )

    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0.3)

    chain = (
        {"context": _retriever | _format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    answer = chain.invoke(question)
    follow_ups = _generate_follow_ups(question, answer, llm)
    return {"answer": answer, "follow_ups": follow_ups}


def _generate_follow_ups(question: str, answer: str, llm: ChatOpenAI) -> list[str]:
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
