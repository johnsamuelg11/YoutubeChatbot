import { useState, useCallback, useRef } from 'react'

/**
 * QuestionInput — sticky bottom input with send button and
 * voice-to-text microphone using the Web Speech API.
 */
export default function QuestionInput({ currentQuestion, setCurrentQuestion, onSubmit, isAsking }) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // ── Voice-to-Text ────────────────────────────────────
  const toggleListening = useCallback(() => {
    // If already listening, stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Your browser does not support speech recognition. Please use Chrome or Edge.')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setCurrentQuestion((prev) => (prev ? prev + ' ' + transcript : transcript))
    }

    recognition.onerror = (event) => {
      console.warn('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognition.start()
  }, [isListening, setCurrentQuestion])

  // ── Handle submit ────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!currentQuestion.trim() || isAsking) return
    onSubmit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 mb-2 sticky bottom-4"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-chocolate/[0.08] bg-white/70 backdrop-blur-md p-2 shadow-[0_-2px_24px_-4px_rgba(75,46,30,0.06)] transition-all duration-200 focus-within:border-olive/25 focus-within:shadow-[0_-2px_32px_-4px_rgba(75,83,32,0.1)]">
        {/* Microphone button */}
        <button
          type="button"
          id="mic-btn"
          onClick={toggleListening}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer ${
            isListening
              ? 'bg-olive text-cream shadow-md animate-pulse-ring'
              : 'text-chocolate-lighter/50 hover:bg-chocolate/[0.05] hover:text-chocolate-lighter'
          }`}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
          title={isListening ? 'Listening… click to stop' : 'Voice input'}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="1" width="6" height="12" rx="3" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </button>

        {/* Text input */}
        <input
          id="question-input"
          type="text"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          placeholder={isListening ? 'Listening…' : 'Ask a question from the video transcript…'}
          disabled={isAsking}
          className="flex-1 bg-transparent py-2 px-2 text-sm text-chocolate placeholder:text-chocolate-lighter/40 focus:outline-none disabled:opacity-50"
          autoComplete="off"
        />

        {/* Send button */}
        <button
          type="submit"
          id="send-question-btn"
          disabled={!currentQuestion.trim() || isAsking}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-olive text-cream shadow-md transition-all duration-200 hover:bg-olive-dark hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none cursor-pointer"
          aria-label="Send question"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>

      {/* Listening indicator */}
      {isListening && (
        <p className="mt-2 text-center text-xs text-olive font-medium animate-fade-in-up">
          🎙️ Listening — speak your question…
        </p>
      )}
    </form>
  )
}
