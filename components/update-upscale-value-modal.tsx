import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface UpdateUpscaleValueModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (keywords: string[]) => void
}

export function UpdateUpscaleValueModal({ isOpen, onClose, onSave }: UpdateUpscaleValueModalProps) {
  const [keywords, setKeywords] = useState<string[]>([])
  const [currentKeyword, setCurrentKeyword] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setKeywords([])
      setCurrentKeyword('')
    }
  }, [isOpen])

  const addKeyword = () => {
    if (currentKeyword && !keywords.includes(currentKeyword)) {
      setKeywords([...keywords, currentKeyword])
      setCurrentKeyword('')
    }
  }

  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  const handleSave = () => {
    onSave(keywords)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Upscale Value</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {keywords.map((keyword, index) => (
            <div key={index} className="flex items-center justify-between">
              <Input value={keyword} readOnly />
              <Button onClick={() => removeKeyword(keyword)} variant="destructive" size="sm">
                Remove
              </Button>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <Input
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              placeholder="Enter keyword"
              onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
            />
            <Button onClick={addKeyword}>Add</Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}