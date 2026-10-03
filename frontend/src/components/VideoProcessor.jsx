/**
 * VideoProcessor — URL input + "Process Video" button with loading states.
 */
export default function VideoProcessor({ videoUrl, setVideoUrl, isProcessing, onProcess }) {
  return (
    <div className="rounded-2xl border border-chocolate/[0.08] bg-white/60 backdrop-blur-sm p-5 shadow-[0_2px_24px_-4px_rgba(75,46,30,0.06)] sm:p-7">
      <label
        htmlFor="video-url-input"
        className="mb-2 block text-sm font-semibold text-chocolate"
      >
        YouTube Video URL
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* URL Input */}
        <div className="relative flex-1">
          {/* YouTube icon */}
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg
              className="h-5 w-5 text-chocolate-lighter/50"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23.498 6.186a2.993 2.993 0 0 0-2.11-2.117C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.388.523A2.993 2.993 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.993 2.993 0 0 0 2.11 2.117c1.883.523 9.388.523 9.388.523s7.505 0 9.388-.523a2.993 2.993 0 0 0 2.11-2.117C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>

          <input
            id="video-url-input"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isProcessing && onProcess()}
            placeholder="https://www.youtube.com/watch?v=..."
            disabled={isProcessing}
            className="w-full rounded-xl border border-chocolate/10 bg-cream py-3 pl-11 pr-4 text-sm text-chocolate placeholder:text-chocolate-lighter/40 transition-all duration-200 focus:border-olive/40 focus:outline-none focus:ring-2 focus:ring-olive/15 disabled:opacity-50"
          />
        </div>

        {/* Process Button */}
        <button
          id="process-video-btn"
          onClick={onProcess}
          disabled={isProcessing}
          className="group relative inline-flex items-center justify-center gap-2 rounded-xl bg-olive px-6 py-3 text-sm font-semibold text-cream shadow-md transition-all duration-200 hover:bg-olive-dark hover:shadow-lg active:scale-[0.97] disabled:pointer-events-none disabled:opacity-60 cursor-pointer sm:min-w-[160px]"
        >
          {isProcessing ? (
            <>
              {/* Spinner */}
              <svg
                className="h-4 w-4 animate-spin-slow"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                />
                <path
                  className="opacity-80"
                  fill="currentColor"
                  d="M4 12a8 8 0 0 1 8-8v3a5 5 0 0 0-5 5H4z"
                />
              </svg>
              <span>Processing…</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Process Video</span>
            </>
          )}
        </button>
      </div>

      {/* Processing hint */}
      {isProcessing && (
        <div className="mt-4 flex items-center gap-2 animate-fade-in-up">
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-olive animate-bounce-dot" style={{ animationDelay: '0ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-olive animate-bounce-dot" style={{ animationDelay: '200ms' }} />
            <span className="h-1.5 w-1.5 rounded-full bg-olive animate-bounce-dot" style={{ animationDelay: '400ms' }} />
          </div>
          <span className="text-xs text-chocolate-lighter">
            Fetching transcript &amp; building knowledge base…
          </span>
        </div>
      )}
    </div>
  )
}
