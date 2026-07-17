export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map(i => {
        const fill = Math.max(0, Math.min(1, rating - i))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-ink-200" size={size} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="text-accent-400" size={size} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

function Star({ className, size }: { className: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.7l1.4-6.8L2.2 9.2l6.9-.8L12 2z" />
    </svg>
  )
}
