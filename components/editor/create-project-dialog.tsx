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

interface CreateProjectDialogProps {
  open: boolean
  formName: string
  roomId: string
  isLoading: boolean
  onFormNameChange: (value: string) => void
  onClose: () => void
  onCreate: () => void
}

export function CreateProjectDialog({
  open,
  formName,
  roomId,
  isLoading,
  onFormNameChange,
  onClose,
  onCreate,
}: CreateProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
      <DialogContent showCloseButton={false} className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-copy-primary">New Project</DialogTitle>
          <DialogDescription>
            Give your project a name to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Project name"
            value={formName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onFormNameChange(e.target.value)
            }
            className="text-copy-primary"
            autoFocus
          />
          {roomId && (
            <p className="text-xs text-copy-muted">
              Room ID:{" "}
              <span className="font-mono text-copy-secondary">{roomId}</span>
            </p>
          )}
        </div>
        <DialogFooter className="rounded-b-3xl">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onCreate}
            disabled={!formName.trim() || !roomId || isLoading}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
