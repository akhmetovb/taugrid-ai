"use client"

import { useRef, useEffect } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AiChatInputProps {
  onSend: (message: string) => void
  onFocus: () => void
  pulsing: boolean
  value: string
  onChange: (value: string) => void
}

export function AiChatInput({ onSend, onFocus, pulsing, value, onChange }: AiChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = value.trim()
      if (!trimmed) return
      onSend(trimmed)
    }
  }

  return (
    <div className="flex items-end gap-2 w-full">
      {/* Input bar */}
      <div className="flex-1 rounded-2xl bg-elevated border border-surface-border px-3 py-2.5 min-h-12 flex items-center">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder="Message AI Engineer…"
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-copy-primary placeholder:text-copy-faint outline-none leading-relaxed overflow-y-auto"
          style={{ minHeight: '1.25rem', maxHeight: '160px' }}
        />
      </div>

      {/* AI presence icon */}
      <div className="shrink-0 h-12 w-12 flex items-center justify-center rounded-xl bg-[rgba(100,87,249,0.15)] border border-[rgba(100,87,249,0.25)] overflow-hidden relative">
        <Sparkles
          className={cn("h-5 w-5 text-ai-text transition-transform", pulsing && "ai-icon-pulse")}
        />
        {pulsing && (
          <span className="absolute inset-0 rounded-xl border border-ai opacity-60 animate-ping" />
        )}
      </div>
    </div>
  )
}
