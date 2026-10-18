import { useEffect, useState } from 'react'

// Does a dropped file fit the `accept` rule (e.g. "image/*,video/*" or ".png")?
function fitsAccept(file, accept) {
  if (!accept) return true
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) => {
      if (rule.startsWith('.')) return file.name.toLowerCase().endsWith(rule)
      if (rule.endsWith('/*')) return file.type.toLowerCase().startsWith(rule.slice(0, -1))
      return file.type.toLowerCase() === rule
    })
}

// A designed replacement for the browser's plain "Choose file" button.
// `files` is always an array of File objects, even when `multiple` is false.
export default function FilePicker({ files, onChange, accept, multiple = false, label, hint }) {
  const [dragging, setDragging] = useState(false)
  const [previews, setPreviews] = useState([])

  // Preview URLs for chosen images; released when the selection changes
  useEffect(() => {
    const urls = files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null))
    setPreviews(urls)
    return () => urls.forEach((u) => u && URL.revokeObjectURL(u))
  }, [files])

  const take = (picked) => {
    const usable = picked.filter((f) => fitsAccept(f, accept))
    if (usable.length === 0) return
    onChange(multiple ? [...files, ...usable] : [usable[0]])
  }

  const handleInput = (e) => {
    const picked = Array.from(e.target.files || [])
    e.target.value = '' // lets the same file be chosen again after removing it
    take(picked)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    take(Array.from(e.dataTransfer?.files || []))
  }

  const remove = (index) => onChange(files.filter((_, i) => i !== index))

  return (
    <div>
      <label
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors focus-within:ring-2 focus-within:ring-cobalt ${
          dragging
            ? 'border-cobalt bg-cobalt/10'
            : 'border-ink/20 bg-white hover:border-cobalt/50 hover:bg-cobalt/5'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInput}
          className="sr-only"
        />
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="text-cobalt"
          aria-hidden="true"
        >
          <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-sm font-medium text-cobalt">{label}</span>
        <span className="text-xs text-ink/50">{hint ?? 'Click to browse, or drop files here'}</span>
      </label>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${file.size}-${i}`}
              className="relative aspect-square overflow-hidden rounded-lg bg-sand"
            >
              {previews[i] ? (
                <img src={previews[i]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-1 text-center">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-ink/60" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="w-full truncate text-[10px] text-ink/60">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${file.name}`}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black/80"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
