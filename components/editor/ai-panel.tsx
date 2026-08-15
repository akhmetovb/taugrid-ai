"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import { RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AiChatInput } from './ai-chat-input'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const GREETING = "Hi, I'm the AI Engineer. What are you working on?"

const STARTER_PROMPTS = [
  'Generate a residential solar + storage layout',
  'Design a microgrid for a small campus',
  'Add battery storage to my current layout',
]

export function AiPanel() {
  const [hasShownGreeting, setHasShownGreeting] = useState(false)
  const [messages, setMessages]                 = useState<Message[]>([])
  const [inputValue, setInputValue]             = useState('')
  const [pulsing, setPulsing]                   = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pulseTimer     = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const triggerPulse = useCallback(() => {
    if (pulseTimer.current) clearTimeout(pulseTimer.current)
    setPulsing(true)
    pulseTimer.current = setTimeout(() => setPulsing(false), 600)
  }, [])

  const handleFocus = useCallback(() => {
    if (!hasShownGreeting) setHasShownGreeting(true)
  }, [hasShownGreeting])

  const handleSend = useCallback((content: string) => {
    if (!hasShownGreeting) setHasShownGreeting(true)
    setMessages((prev) =>
      prev.length === 0
        ? [{ role: 'assistant', content: GREETING }, { role: 'user', content }]
        : [...prev, { role: 'user', content }]
    )
    setInputValue('')
    triggerPulse()
  }, [hasShownGreeting, triggerPulse])

  const handleStarterPrompt = useCallback((prompt: string) => {
    setHasShownGreeting(true)
    setMessages([
      { role: 'assistant', content: GREETING },
      { role: 'user', content: prompt },
    ])
    triggerPulse()
  }, [triggerPulse])

  const handleReset = useCallback(() => {
    setMessages([])
    setHasShownGreeting(false)
    setInputValue('')
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 w-72">

      {/* State 1: Full empty state card */}
      {!hasShownGreeting && (
        <div className="relative rounded-3xl bg-surface border border-surface-border shadow-2xl p-6">
          <button
            onClick={handleReset}
            aria-label="Reset"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-copy-faint hover:text-copy-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="flex flex-col items-center text-center gap-4">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-[rgba(100,87,249,0.15)] border border-[rgba(100,87,249,0.2)]">
              <Sparkles className="h-5 w-5 text-ai-text" />
            </div>

            <p className="text-sm font-semibold text-copy-primary leading-snug">
              Design your energy system together
            </p>

            <div className="flex flex-col gap-2 w-full text-left">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleStarterPrompt(prompt)}
                  className="text-sm text-ai-text hover:text-copy-primary text-left transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <p className="text-xs text-copy-muted">Chat below to get started</p>
          </div>
        </div>
      )}

      {/* State 2: Greeting bubble only (no card chrome) */}
      {hasShownGreeting && messages.length === 0 && (
        <div
          className="self-start px-3 py-2.5 bg-elevated border border-surface-border text-sm text-copy-secondary max-w-[85%]"
          style={{ borderRadius: '14px 14px 14px 4px' }}
        >
          {GREETING}
        </div>
      )}

      {/* State 3: Message thread card */}
      {messages.length > 0 && (
        <div className="relative rounded-3xl bg-surface border border-surface-border shadow-2xl overflow-hidden">
          <button
            onClick={handleReset}
            aria-label="Reset conversation"
            className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-copy-faint hover:text-copy-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <div className="max-h-[70vh] overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {msg.role === 'user' ? (
                  <div className="px-3 py-2 text-sm text-copy-primary bg-accent-dim border-2 border-brand/50 rounded-2xl max-w-[85%]">
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className="px-3 py-2 text-sm text-copy-secondary bg-elevated border border-surface-border max-w-[85%]"
                    style={{ borderRadius: '14px 14px 14px 4px' }}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input row: icon + bar, same total width as card */}
      <AiChatInput
        onSend={handleSend}
        onFocus={handleFocus}
        pulsing={pulsing}
        value={inputValue}
        onChange={setInputValue}
      />
    </div>
  )
}
