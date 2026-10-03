/**
 * FollowUpChips — horizontal pill-shaped suggested follow-up questions
 * below an AI answer.
 */
export default function FollowUpChips({ suggestions, onChipClick }) {
  if (!suggestions || suggestions.length === 0) return null

  return (
    <div className="mt-2.5 flex flex-wrap gap-2">
      {suggestions.map((text, idx) => (
        <button
          key={idx}
          onClick={() => onChipClick(text)}
          className="inline-flex items-center gap-1.5 rounded-full border border-olive/30 bg-cream px-3.5 py-1.5 text-xs font-medium text-olive transition-all duration-200 hover:bg-olive hover:text-cream hover:border-olive hover:shadow-md active:scale-95 cursor-pointer"
        >
          <svg className="h-3 w-3 shrink-0 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          {text}
        </button>
      ))}
    </div>
  )
}
