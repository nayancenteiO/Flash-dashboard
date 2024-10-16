import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ConfirmCopyToLiveModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  lensName: string
}

export function ConfirmCopyToLiveModal({ isOpen, onClose, onConfirm, lensName }: ConfirmCopyToLiveModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Copy to Live</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to copy the lens "{lensName}" to the live environment?</p>
        <p>This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>Confirm Copy to Live</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}