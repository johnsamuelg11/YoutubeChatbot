/**
 * Header — centered title and subtitle with decorative gradient.
 */
export default function Header() {
  return (
    <header className="pt-10 pb-6 text-center sm:pt-14 sm:pb-8">
      {/* Decorative badge */}
      <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-olive/20 bg-olive/[0.06] px-4 py-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive opacity-50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-olive" />
        </span>
        <span className="text-xs font-medium tracking-wide text-olive">
          AI-Powered
        </span>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-chocolate sm:text-4xl md:text-5xl">
        AI-Powered{' '}
        <span className="bg-gradient-to-r from-chocolate via-chocolate-light to-olive bg-clip-text text-transparent">
          Tutor
        </span>
      </h1>

      <p className="mt-3 text-sm text-chocolate-lighter sm:text-base max-w-lg mx-auto leading-relaxed">
        Ask questions from YouTube lecture transcripts.
        <br className="hidden sm:block" />
        Paste a video URL below to get started.
      </p>
    </header>
  )
}
