import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import FollowUpChips from './FollowUpChips'

/**
 * ChatWindow — scrollable chat area with auto-scroll, user/AI message
 * bubbles, typing indicator, and follow-up chips.
 */
export default function ChatWindow({ chatHistory, isAsking, onFollowUpClick }) {
  const bottomRef = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, isAsking])

  return (
    <div className="flex-1 overflow-y-auto rounded-2xl border border-chocolate/[0.06] bg-white/40 backdrop-blur-sm p-4 sm:p-6 min-h-[300px] max-h-[50vh] space-y-4">
      {/* Empty state */}
      {chatHistory.length === 0 && !isAsking && (
        <div className="flex h-full flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-olive/[0.07]">
            <svg className="h-7 w-7 text-olive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-chocolate-lighter">
            Ask your first question about the video
          </p>
          <p className="mt-1 text-xs text-chocolate-lighter/60">
            The AI will answer based on the transcript
          </p>
        </div>
      )}

      {/* Chat messages */}
      {chatHistory.map((msg, idx) => (
        <div
          key={idx}
          className={`flex animate-fade-in-up ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
          style={{ animationDelay: `${Math.min(idx * 50, 200)}ms` }}
        >
          {msg.role === 'user' ? (
            /* ── User bubble ── */
            <div className="max-w-[80%] sm:max-w-[70%]">
              <div className="rounded-2xl rounded-br-md bg-chocolate px-4 py-3 text-sm leading-relaxed text-cream shadow-md">
                {msg.content}
              </div>
              <p className="mt-1 text-right text-[10px] text-chocolate-lighter/40">You</p>
            </div>
          ) : (
            /* ── AI bubble ── */
            <div className="max-w-[85%] sm:max-w-[75%]">
              <div className="flex items-start gap-2.5">
                {/* AI avatar */}
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive/10">
                  <svg className="h-3.5 w-3.5 text-olive" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.17A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.83-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zm-3 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
                  </svg>
                </div>

                <div className="flex-1">
                  <div className="markdown-body rounded-2xl rounded-tl-md border border-chocolate/[0.08] bg-cream px-4 py-3 text-sm leading-relaxed text-chocolate shadow-sm">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Follow-up chips */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <FollowUpChips
                      suggestions={msg.followUps}
                      onChipClick={onFollowUpClick}
                    />
                  )}

                  <p className="mt-1 text-[10px] text-chocolate-lighter/40">AI Tutor</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Typing indicator */}
      {isAsking && (
        <div className="flex justify-start animate-fade-in-up">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-olive/10">
              <svg className="h-3.5 w-3.5 text-olive" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.17A7 7 0 0 1 14 23h-4a7 7 0 0 1-6.83-4H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 12 2zm-3 12a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" />
              </svg>
            </div>
            <div className="rounded-2xl rounded-tl-md border border-chocolate/[0.08] bg-cream px-5 py-3.5 shadow-sm">
              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-chocolate-lighter/40 animate-bounce-dot" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 rounded-full bg-chocolate-lighter/40 animate-bounce-dot" style={{ animationDelay: '200ms' }} />
                <span className="h-2 w-2 rounded-full bg-chocolate-lighter/40 animate-bounce-dot" style={{ animationDelay: '400ms' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}
