import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

interface TextFieldDialogProps {
  fieldName: string;
  value: string;
  onSave: (newValue: string) => Promise<void>;
  maxLength?: number;
}

export const TextFieldDialog: React.FC<TextFieldDialogProps> = ({ fieldName, value, onSave, maxLength }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpen = () => {
    setTempValue(value);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(tempValue);
      handleClose();
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="cursor-pointer mobile-100 d-block rounded-md w-[150px]" onClick={handleOpen}>
          {value || "Enter badge text"}
        </span>
      </DialogTrigger>
      <DialogContent className='login-popup'>
        <DialogHeader>
          <DialogTitle>Edit {fieldName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            maxLength={maxLength}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button className='mb-01' onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};