"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface RenameProjectDialogProps {
  open: boolean
  currentName: string
  formName: string
  isLoading: boolean
  onFormNameChange: (value: string) => void
  onClose: () => void
  onRename: () => void
}

export function RenameProjectDialog({
  open,
  currentName,
  formName,
  isLoading,
  onFormNameChange,
  onClose,
  onRename,
}: RenameProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton={false} className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">Rename Project</DialogTitle>
          <DialogDescription>
            Renaming <span className="text-copy-secondary">{currentName}</span>
          </DialogDescription>
        </DialogHeader>
        <Input
          value={formName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onFormNameChange(e.target.value)
          }
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && formName.trim()) onRename()
          }}
          className="text-copy-primary"
          autoFocus
        />
        <DialogFooter className="rounded-b-3xl">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onRename}
            disabled={!formName.trim() || isLoading}
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
