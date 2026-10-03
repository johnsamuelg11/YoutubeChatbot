/**
 * Notification — success / error banner that slides in from the top.
 */
export default function Notification({ notification, onDismiss }) {
  if (!notification) return null

  const isSuccess = notification.type === 'success'

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center p-4 animate-fade-in-up">
      <div
        role="alert"
        className={`flex items-center gap-3 rounded-xl border px-5 py-3 shadow-lg backdrop-blur-sm max-w-lg w-full transition-all duration-300 ${
          isSuccess
            ? 'border-olive/20 bg-olive/[0.08] text-olive-dark'
            : 'border-red-300/40 bg-red-50/80 text-red-800'
        }`}
      >
        {/* Icon */}
        {isSuccess ? (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        ) : (
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}

        <span className="flex-1 text-sm font-medium">{notification.message}</span>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 transition-colors hover:bg-black/5 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
