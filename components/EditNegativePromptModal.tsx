import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface NegativeKeyword {
  negativeKeyword: string;
  replaceNegativeKeywords: string;
  isDeleted: boolean;
  _id: string;
}

interface EditNegativePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  lensId: string;
  // onSave: (lensId: string, newNegativeKeywords: NegativeKeyword[]) => Promise<void>;
}

export default function EditNegativePromptModal({
  isOpen,
  onClose,
  lensId,
  // onSave,
}: EditNegativePromptModalProps) {
  const [keywords, setKeywords] = useState<NegativeKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingKeywords, setDeletingKeywords] = useState<Set<string>>(new Set());

  const fetchNegativeKeywords = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getAlldata');
      if (!response.ok) {
        throw new Error('Failed to fetch lens data');
      }
      const result = await response.json();
      
      if (result.data && Array.isArray(result.data)) {
        const lens = result.data.find((item: any) => item.lensId === lensId);
        if (lens && lens.negativeKeyReplace) {
          setKeywords(lens.negativeKeyReplace);
        } else {
          setKeywords([]);
        }
      } else {
        console.error('API response does not contain an array in the data property:', result);
        setKeywords([]);
      }
    } catch (error) {
      console.error('Error fetching negative keywords:', error);
      toast({
        title: "Error",
        description: "Failed to fetch negative keywords. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [lensId]);

  useEffect(() => {
    if (isOpen) {
      fetchNegativeKeywords();
    }
  }, [isOpen, fetchNegativeKeywords]);

  const handleAddKeyword = useCallback(() => {
    setKeywords(prev => [...prev, { negativeKeyword: '', replaceNegativeKeywords: '', isDeleted: false, _id: '' }]);
  }, []);

  const handleRemoveKeyword = useCallback(async (index: number, keywordId: string) => {
    setDeletingKeywords(prev => new Set(prev).add(keywordId));
    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/deleteNegativeReplaceKeywords/${keywordId}/${lensId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete keyword');
      }

      setKeywords(prev => prev.filter((_, i) => i !== index));
      toast({
        title: "Success",
        description: "Keyword deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting keyword:', error);
      toast({
        title: "Error",
        description: "Failed to delete keyword. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingKeywords(prev => {
        const newSet = new Set(prev);
        newSet.delete(keywordId);
        return newSet;
      });
    }
  }, [lensId]);

  const handleKeywordChange = useCallback((index: number, field: 'negativeKeyword' | 'replaceNegativeKeywords', value: string) => {
    setKeywords(prev => prev.map((k, i) => i === index ? { ...k, [field]: value } : k));
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const requestBody = keywords.map(keyword => ({
        _id: keyword._id,
        modelId: keyword.negativeKeyword,
        replaceModelId: keyword.replaceNegativeKeywords
      }));

      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/addNegativeReplaceKeywords/${lensId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          models : requestBody}),
      });

      if (!response.ok) {
        throw new Error('Failed to update negative keywords');
      }

      const result = await response.json();
      if (result.success) {
        onClose();
        toast({
          title: "Success",
          description: "Negative keywords updated successfully",
        });
      } else {
        throw new Error(result.message || 'Failed to update negative keywords');
      }
    } catch (error) {
      console.error('Error updating negative keywords:', error);
      toast({
        title: "Error",
        description: "Failed to update negative keywords. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] w-full">
        <DialogHeader>
          <DialogTitle>Add Negative & Replace Keywords</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
          {keywords.map((keyword, index) => (
            <div key={keyword._id} className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor={`negative-${index}`}>Negative Keywords</Label>
                <Input
                  id={`negative-${index}`}
                  value={keyword.negativeKeyword}
                  onChange={(e) => handleKeywordChange(index, 'negativeKeyword', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`replace-${index}`}>Replace Negative Keywords</Label>
                <Input
                  id={`replace-${index}`}
                  value={keyword.replaceNegativeKeywords}
                  onChange={(e) => handleKeywordChange(index, 'replaceNegativeKeywords', e.target.value)}
                />
              </div>
              <Button 
                variant="destructive" 
                onClick={() => handleRemoveKeyword(index, keyword._id)}
                disabled={deletingKeywords.has(keyword._id)}
              >
                {deletingKeywords.has(keyword._id) ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
              </Button>
            </div>
          ))}
          <Button onClick={handleAddKeyword}>Add Keywords</Button>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button  disabled={isLoading} onClick={handleSave}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}