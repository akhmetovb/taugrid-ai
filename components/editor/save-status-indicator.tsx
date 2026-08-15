"use client"

import { Check, Loader2, CircleAlert, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSaveStatus } from "./save-status-context"
import { cn } from "@/lib/utils"

const STATE = {
  idle:   { icon: Save,        label: "Save",        className: "text-copy-muted hover:text-copy-primary" },
  saving: { icon: Loader2,     label: "Saving…",     className: "text-copy-muted" },
  saved:  { icon: Check,       label: "Saved",       className: "text-state-success hover:text-state-success" },
  error:  { icon: CircleAlert, label: "Save failed", className: "text-state-error hover:text-state-error" },
} as const

export function SaveStatusIndicator() {
  const { status, save, canSave } = useSaveStatus()
  const { icon: Icon, label, className } = STATE[status]

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={save}
      disabled={!canSave || status === "saving"}
      title="Save now"
      aria-live="polite"
      className={cn("h-8 gap-1.5 disabled:opacity-100", className)}
    >
      <Icon className={cn("h-4 w-4", status === "saving" && "animate-spin")} />
      {label}
    </Button>
  )
}
