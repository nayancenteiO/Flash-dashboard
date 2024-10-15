'use client'

import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from 'next/image'

type Lens = {
  display: boolean
  premiumLens: boolean
  image: string | null
  textToImageModel: string
  isUpscale: boolean
  leonardoModelId: string
  maxTokens: number
  imageToTextModel: string
  name: string
  lensId: string
  id: number
  prompt: string
  lastPrompt: string
  stylePrompt: string
  quality: string
  systemPrompt: string
  creditconsumption: number
  promptgenerationflow: string
  upscaleKey: string
  negativePrompt: string
  civitaiSampler: string
  civitaiSeed: string
  civitaiAspectRatio: string
  civitaiLoraModel: string
  steps: number
  cfgScale: number
  ModelsLabLoraModel: string[]
  embeddingModel: string[]
  sampler: string
  order: number
  usageCount: number
  dislikeFeedbackCount: number
  Aproxtime: string
  dislikeRate: string
  negativeKeyReplace: {
    negativeKeyword: string
    replaceNegativeKeywords: string
    isDeleted: boolean
    _id: string
  }[]
  badgeText: string
  badge: boolean
  isDeleted: boolean
  createdAt: string
  __v: number
  lastUpdate: Date
}

interface CopyLensModalProps {
  lens: Lens
  isOpen: boolean
  onClose: () => void
  onCopy: (updatedLens: Lens) => void
}

export function CopyLensModal({ lens, isOpen, onClose, onCopy }: CopyLensModalProps) {
  const [editedLens, setEditedLens] = useState<Lens>(lens)
  const [previewImage, setPreviewImage] = useState<string | null>(lens.image)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (field: keyof Lens, value: any) => {
    setEditedLens(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        handleInputChange('image', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="login-popup  sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px] w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Copy Lens: {lens.name}</DialogTitle>
        </DialogHeader>
        <div className="mt-2 grid grid-cols-3 gap-4">
          <div className="space-y-2">
          
          <Label htmlFor="name">Lens Name</Label>
            <Input
              id="name"
              value={editedLens.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lensImage">Lens Image</Label>
            <div 
              className="w-full overflow-hidden h-32 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer"
              onClick={handleImageClick}
            >
              {previewImage ? (
                <Image src={previewImage} alt="Lens preview" width={128} height={128} className="object-cover" />
              ) : (
                <span className="text-gray-500">Click to upload</span>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
              accept="image/*"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="premiumLens">Premium Lens</Label>
            <Select
              value={editedLens.display.toString()}
              onValueChange={(value) => handleInputChange('premiumLens', value === 'true')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select display option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display">Display</Label>
            <Select
              value={editedLens.display.toString()}
              onValueChange={(value) => handleInputChange('display', value === 'true')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select display option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="imageToTextModel">Model</Label>
            <Select
              value={editedLens.imageToTextModel}
              onValueChange={(value) => handleInputChange('imageToTextModel', value)}
            >
             <SelectTrigger className="">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="claude-3-opus-20240229">claude-3-opus</SelectItem>
                              <SelectItem value="claude-3-haiku-20240307">claude-3-haiku</SelectItem>
                              <SelectItem value="claude-3-sonnet-20240229">claude-3-sonnet</SelectItem>
                              <SelectItem value="claude-3-5-sonnet-20240620">claude-3-5-sonnet</SelectItem>
                              <SelectItem value="gpt-4o">gpt-4o</SelectItem>
                              <SelectItem value="gpt-4o-mini">gpt-4o-mini</SelectItem>
                              <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                            </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="textToImageModel">Image Model</Label>
            <Select
              value={editedLens.textToImageModel}
              onValueChange={(value) => handleInputChange('textToImageModel', value)}
            >
              <SelectTrigger id="textToImageModel">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
              <SelectContent>
                              <SelectItem value="sd3">sd3</SelectItem>
                              <SelectItem value="flux-pro(1.1)">flux-pro(1.1)</SelectItem>
                              <SelectItem value="sd3-large-turbo">sd3-large-turbo</SelectItem>
                              <SelectItem value="sd3-large">sd3-large</SelectItem>
                              <SelectItem value="core">core</SelectItem>
                              <SelectItem value="sdxl-1.0">sdxl-1.0</SelectItem>
                              <SelectItem value="sd-1.6">sd-1.6</SelectItem>
                              <SelectItem value="dall-e-3">dall-e-3</SelectItem>
                              <SelectItem value="Dreamshaper XL">Dreamshaper XL</SelectItem>
                              <SelectItem value="Anime model">Animagine XL</SelectItem>
                              <SelectItem value="Juggernaut-XL">Juggernaut XL</SelectItem>
                              <SelectItem value="flux-dev">flux-dev</SelectItem>
                              <SelectItem value="flux-schnell">flux-schnell</SelectItem>
                              <SelectItem value="flux-pro">flux-pro</SelectItem>
                              <SelectItem value="flux-realism">flux-realism</SelectItem>
                              <SelectItem value="face-Gen">face-Gen</SelectItem>
                              <SelectItem value="replicate-flux-schnell">replicate-flux-schnell</SelectItem>
                            </SelectContent>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={editedLens.maxTokens}
              onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quality">Quality</Label>
            <Input
              id="quality"
              value={editedLens.quality}
              onChange={(e) => handleInputChange('quality', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="upscaleKey">Upscale Key</Label>
            <Select
              value={editedLens.upscaleKey}
              onValueChange={(value) => handleInputChange('upscaleKey', value)}
            >
              <SelectTrigger id="upscaleKey">
                <SelectValue placeholder="Select Upscale Key" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clarity-upscaler">Clarity Upscaler</SelectItem>
                <SelectItem value="esrgan">Esrgan</SelectItem>
                <SelectItem value="Real-Easargan">Real-Easargan</SelectItem>
                <SelectItem value="Real-esrgan-2">Real-esrgan 2</SelectItem>
                <SelectItem value="fast-upscaler">Fast Upscaler</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="creditconsumption">Lens Credit</Label>
            <Input
              id="creditconsumption"
              type="number"
              value={editedLens.creditconsumption}
              onChange={(e) => handleInputChange('creditconsumption', parseInt(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="promptgenerationflow">Prompt Generation Flow</Label>
            <Select
              value={editedLens.promptgenerationflow}
              onValueChange={(value) => handleInputChange('promptgenerationflow', value)}
            >
              <SelectTrigger id="promptgenerationflow">
                <SelectValue placeholder="Select flow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Flow B">Flow B</SelectItem>
                <SelectItem value="Flow C">Flow C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="badge">Badge</Label>
            <Select
              value={editedLens.display.toString()}
              onValueChange={(value) => handleInputChange('badge', value === 'true')}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select display option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="badgeText">Badge Text</Label>
            <Input
              id="badgeText"
              value={editedLens.badgeText}
              onChange={(e) => handleInputChange('badgeText', e.target.value)}
            />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-4'>
          <div className="space-y-2 mt-4">
            <Label htmlFor="stylePrompt">Style Prompt</Label>
            <Textarea
              id="stylePrompt"
              value={editedLens.stylePrompt}
              onChange={(e) => handleInputChange('stylePrompt', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              value={editedLens.prompt}
              onChange={(e) => handleInputChange('prompt', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="negativePrompt">Negative Prompt</Label>
            <Textarea
              id="negativePrompt"
              value={editedLens.negativePrompt}
              onChange={(e) => handleInputChange('negativePrompt', e.target.value)}
              rows={3}
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="lastPrompt">Last Prompt</Label>
            <Textarea
              id="lastPrompt"
              value={editedLens.lastPrompt}
              onChange={(e) => handleInputChange('lastPrompt', e.target.value)}
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button className='mb-01'  onClick={() => onCopy(editedLens)}>Copy Lens</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}