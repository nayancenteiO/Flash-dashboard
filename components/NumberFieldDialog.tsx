import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

interface NumberFieldDialogProps {
  fieldName: string;
  value: number | string;
  onSave: (newValue: number) => Promise<void>;
  min?: number;
  max?: number;
  step?: number;
}

export const NumberFieldDialog: React.FC<NumberFieldDialogProps> = ({ fieldName, value, onSave, min, max, step }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setTempValue(value.toString());
    setIsOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const validateInput = (value: string): boolean => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return false;
    }
    if (min !== undefined && numValue < min) {
      setError(`Value must be at least ${min}`);
      return false;
    }
    if (max !== undefined && numValue > max) {
      setError(`Value must be at most ${max}`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    // if (!validateInput(tempValue)) return;

    setIsLoading(true);
    try {
      await onSave(parseFloat(tempValue));
      handleClose();
    } catch (error) {
      console.error(`Error updating ${fieldName}:`, error);
      setError("Failed to save. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="cursor-pointer mobile-100 d-block rounded-md" onClick={handleOpen}>
          {value === '' ? 'Not set' : value}
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
            onChange={(e) => {
              setTempValue(e.target.value);
            }}
            placeholder={`Enter ${fieldName}`}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button className='mb-01' onClick={handleSave} disabled={isLoading || !!error}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};