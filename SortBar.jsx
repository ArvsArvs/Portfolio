const OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'popular', label: 'Most liked' },
]

export default function SortBar({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            value === opt.value
              ? 'bg-ink text-paper border-ink'
              : 'border-ink/20 text-ink/70 hover:border-ink/40'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
