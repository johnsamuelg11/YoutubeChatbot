import { useState, useCallback } from 'react'
import Header from './components/Header'
import VideoProcessor from './components/VideoProcessor'
import ChatWindow from './components/ChatWindow'
import QuestionInput from './components/QuestionInput'
import Notification from './components/Notification'

// ── Backend base URL ─────────────────────────────────
// Uses VITE_API_URL env var if set (e.g. for local dev),
// otherwise defaults to the production Render backend.
const API_BASE =
  import.meta.env.VITE_API_URL || 'https://youtubechatbot-418u.onrender.com'

/**
 * Main application component — orchestrates the video processing
 * and Q&A chat flow for the AI-Powered Tutor.
 */
export default function App() {
  // ── State ────────────────────────────────────────────
  const [videoUrl, setVideoUrl] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isProcessed, setIsProcessed] = useState(false)
  const [notification, setNotification] = useState(null) // { type: 'success' | 'error', message }
  const [chatHistory, setChatHistory] = useState([])     // { role: 'user' | 'ai', content, followUps? }
  const [isAsking, setIsAsking] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState('')

  // ── Notification helper ──────────────────────────────
  const showNotification = useCallback((type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }, [])

  // ── Process Video ────────────────────────────────────
  const handleProcessVideo = useCallback(async () => {
    if (!videoUrl.trim()) {
      showNotification('error', 'Please enter a valid YouTube URL.')
      return
    }

    setIsProcessing(true)
    setNotification(null)
    setIsProcessed(false)
    setChatHistory([])

    try {
      const res = await fetch(`${API_BASE}/api/process-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl.trim() }),
      })

      const data = await res.json()

      if (res.ok) {
        setIsProcessed(true)
        showNotification('success', data.message || 'Transcript processed successfully!')
      } else {
        showNotification('error', data.error || 'Failed to process video.')
      }
    } catch (err) {
      console.error('Process Video error:', err)
      showNotification('error', 'Network error — could not reach the server.')
    } finally {
      setIsProcessing(false)
    }
  }, [videoUrl, showNotification])

  // ── Ask Question ─────────────────────────────────────
  const handleAskQuestion = useCallback(async (question) => {
    const q = (question ?? currentQuestion).trim()
    if (!q) return

    // Push user message
    setChatHistory((prev) => [...prev, { role: 'user', content: q }])
    setCurrentQuestion('')
    setIsAsking(true)

    try {
      const res = await fetch(`${API_BASE}/api/ask-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      })

      const data = await res.json()

      if (res.ok) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'ai',
            content: data.answer || 'No answer returned.',
            followUps: data.follow_ups || [],
          },
        ])
      } else {
        setChatHistory((prev) => [
          ...prev,
          { role: 'ai', content: `Error: ${data.error || 'Something went wrong.'}` },
        ])
      }
    } catch (err) {
      console.error('Ask Question error:', err)
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', content: 'Network error — could not reach the server.' },
      ])
    } finally {
      setIsAsking(false)
    }
  }, [currentQuestion])

  // ── Follow-up chip click ─────────────────────────────
  const handleFollowUpClick = useCallback((text) => {
    handleAskQuestion(text)
  }, [handleAskQuestion])

  // ── Render ───────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-olive/[0.04] blur-3xl" />
        <div className="absolute -bottom-60 -left-40 h-[600px] w-[600px] rounded-full bg-chocolate/[0.03] blur-3xl" />
      </div>

      {/* Notification banner */}
      <Notification notification={notification} onDismiss={() => setNotification(null)} />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 sm:px-6">
        <Header />

        <VideoProcessor
          videoUrl={videoUrl}
          setVideoUrl={setVideoUrl}
          isProcessing={isProcessing}
          onProcess={handleProcessVideo}
        />

        {isProcessed && (
          <div className="mt-6 flex flex-1 flex-col animate-fade-in-up">
            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-chocolate/10" />
              <span className="text-xs font-medium text-chocolate-lighter tracking-widest uppercase">
                Conversation
              </span>
              <div className="h-px flex-1 bg-chocolate/10" />
            </div>

            <ChatWindow
              chatHistory={chatHistory}
              isAsking={isAsking}
              onFollowUpClick={handleFollowUpClick}
            />

            <QuestionInput
              currentQuestion={currentQuestion}
              setCurrentQuestion={setCurrentQuestion}
              onSubmit={() => handleAskQuestion()}
              isAsking={isAsking}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-chocolate-lighter/60">
        Built with LangChain, FAISS &amp; OpenAI
      </footer>
    </div>
  )
}
