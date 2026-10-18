export default function HashtagPill({ tag, onClick, active }) {
  return (
    <button
      onClick={() => onClick?.(tag)}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        active
          ? 'bg-cobalt text-paper border-cobalt'
          : 'border-cobalt/30 text-cobalt hover:bg-cobalt/10'
      }`}
    >
      #{tag}
    </button>
  )
}
