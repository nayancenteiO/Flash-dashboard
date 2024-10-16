'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import React, { useMemo } from 'react'
import { Camera, Loader2, Copy, Trash2, MoveUp, MoveDown, LogIn, Menu, Upload, Plus, Search, Pencil, Clock } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Calendar as CalendarIcon } from "lucide-react"
import { isValid, parseISO, format } from 'date-fns'
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import Header from './header'
import { ModelDropdown } from './model-dropdown'
import { log } from 'console'
import { LensNameDialog } from './LensNameDialog'
import { NumberFieldDialog } from './NumberFieldDialog'
import { AproxTimeDialog } from './AproxTimeDialog'
import EditNegativePromptModal from './EditNegativePromptModal'
import { TextFieldDialog } from './TextFieldDialog'
import { CopyLensModal } from './CopyLensModal'
import { ScheduledPublishTimeCell } from './scheduled-publish-time-cell'
import CryptoJS from 'crypto-js';


type Lens = {
  display: boolean;
  premiumLens: boolean;
  image: string | null;
  textToImageModel: string;
  isUpscale: boolean
  leonardoModelId: string
  maxTokens: number;
  imageToTextModel: string;
  name: string;
  lensId: string;
  id: number;
  prompt: string;
  lastPrompt: string
  stylePrompt: string;
  quality: string
  systemPrompt: string
  creditconsumption: number;
  promptgenerationflow: string;
  upscaleKey: string
  negativePrompt: string;
  civitaiSampler: string
  civitaiSeed: string
  civitaiAspectRatio: string
  civitaiLoraModel: string
  steps: number;
  cfgScale: number;
  ModelsLabLoraModel: string[]
  embeddingModel: string[]
  sampler: string
  order: number
  usageCount: number;
  dislikeFeedbackCount: number
  Aproxtime: string;
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
  lastUpdate: Date;
  scheduledPublishTime: string | null;
}


export function AiLensDashboard() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    category: "",
    subscribe: false,
    preference: "",
    attachment: null as File | null
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [editingAproxTimeId, setEditingAproxTimeId] = useState<number | null>(null);

  const [lenses, setLenses] = useState<Lens[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [entriesPerPage, setEntriesPerPage] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [editingLensId, setEditingLensId] = useState<string | null>(null)
  const [isEditNegativePromptModalOpen, setIsEditNegativePromptModalOpen] = useState(false)
  const [movingLens, setMovingLens] = useState<number | null>(null)
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [selectedLens, setSelectedLens] = useState<Lens | null>(null)
  
  const decryptText = (keys: string, ivs: string, encryptedDatas: string): string => {
    try {

      const key = CryptoJS.enc.Hex.parse(keys);
      const iv = CryptoJS.enc.Hex.parse(ivs);

      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encryptedDatas)
      });

      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });


      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error("Decryption error:", error);
      return "";
    }
  };

  const fetchLensData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://dashboard.flashailens.com/api/dashboard/getAllData');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('API response is not in the expected format');
      }

      const formattedLenses: Lens[] = await Promise.all(result.data.map(async (item: any) => {
        const decryptIfNeeded = (encryptedData: string) => {
          const data = JSON.parse(encryptedData)

          if (encryptedData) {
            return decryptText(data.key, data.iv, data.encryptedData);
          }
          return encryptedData;
        };

        return {
          id: item._id || '',
          lensId: item.lensId || '',
          name: item.lensName || '',
          display: item.display || false,
          badge: item.badge || false,
          premiumLens: item.premiumLens || false,
          creditconsumption: parseInt(item.lensCredit) || 0,
          badgeText: item.badgeText || '',
          promptgenerationflow: item.promptFlow || '',
          quality: item.quality || '',
          scheduledPublishTime: item.scheduleLensPublishTime,

          // Decrypting the necessary fields
          imageToTextModel: decryptIfNeeded(item.model) || '',
          maxTokens: parseInt(decryptIfNeeded(item.maxTokens)) || 0,
          textToImageModel: decryptIfNeeded(item.imageModel) || '',

          lastUpdate: new Date(item.updatedAt || Date.now()),
          prompt: decryptIfNeeded(item.prompt) || '',
          stylePrompt: item.stylePrompt !== '' ? decryptIfNeeded(item.stylePrompt) : '',
          negativePrompt: item.negativePrompt !== '' ? decryptIfNeeded(item.negativePrompt) : '',

          Aproxtime: item.approxTime || '',
          steps: parseInt(item.civitaiSteps) || 0,
          cfgScale: parseFloat(item.civitaiCFGScale) || 0,
          image: item.image || null,
          usageCount: parseInt(item.lensUses) || 0
        };
      }));

      setLenses(formattedLenses);

    } catch (error) {
      console.error('Error fetching lens data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lens data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLensData();
  }, []);

  const handleAproxTimeEdit = (id: number) => {
    setEditingAproxTimeId(id);
  };

  const handleAproxTimeSave = (id: number, newAproxTime: string) => {
    handleLensInputChange(id, 'Aproxtime', newAproxTime);
    setEditingAproxTimeId(null);
  };

  useEffect(() => {
    if (editingId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const handleNameEdit = (id: number) => {
    setEditingId(id);
  };

  const handleNameSave = async (id: number, newName: string) => {

    const formData = new FormData();
    formData.append('lensName', newName);
    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update lens name');
      }

      const result = await response.json();

      // Update the local state
      setLenses(lenses.map(lens =>
        lens.id === id ? { ...lens, name: newName } : lens
      ));

      toast({
        title: "Success",
        description: "Lens name updated successfully",
      });
    } catch (error) {
      console.error('Error updating lens name:', error);
      toast({
        title: "Error",
        description: "Failed to update lens name. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) { // Add class if scrolled down more than 50px
        document.body.classList.add('scrolled');
        setIsScrolled(true);
      } else {
        document.body.classList.remove('scrolled');
        setIsScrolled(false);
      }
    };

    // Add the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn');
      const storedEmail = localStorage.getItem('email');

      if (loggedInStatus === 'true' && storedEmail) {
        setIsLoggedIn(true);
        setEmail(storedEmail);
      } else {
        setIsLoggedIn(false);
        setEmail('');
      }
    };

    checkLoginStatus();

    // Add event listener for storage changes
    window.addEventListener('storage', checkLoginStatus);

    // Cleanup
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate an API call
    setTimeout(() => {
      setLenses(lenses.map(lens => ({ ...lens, lastUpdate: new Date() })))
      setIsLoading(false)
    }, 1000)
  }

  const handleModelSelect = (option: string) => {
    // Handle the selected option here
    console.log(`Selected option: ${option}`)
    toast({
      title: "Model Action",
      description: `You selected: ${option}`,
    })
    // You can add more specific logic for each option here
  }

  const filteredLenses = lenses.filter(lens =>
    lens.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lens.imageToTextModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lens.textToImageModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lens.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lens.stylePrompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lens.negativePrompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = entriesPerPage === "All"
    ? 1
    : Math.ceil(filteredLenses.length / parseInt(entriesPerPage))

  const displayedLenses = entriesPerPage === "All"
    ? filteredLenses
    : filteredLenses.slice(
      (currentPage - 1) * parseInt(entriesPerPage),
      currentPage * parseInt(entriesPerPage)
    )
  const handleEntriesPerPageChange = (value: string) => {
    setEntriesPerPage(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Here you would typically send the formData to your backend
    // For this example, we'll just update the lenses with a new timestamp
    setTimeout(() => {
      setLenses(lenses.map(lens => ({ ...lens, lastUpdate: new Date() })));
      setIsLoading(false);
      setIsModalOpen(false);
      toast({
        title: "Lenses Refreshed",
        description: "Your lenses have been updated with the new information.",
      });
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData(prev => ({ ...prev, preference: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({ ...prev, attachment: e.target.files![0] }));
    }
  };

  const handleDisplayToggle = useCallback((id: number) => {
    setLenses(prevLenses => prevLenses.map(lens =>
      lens.id === id ? { ...lens, display: !lens.display } : lens
    ));

    // Send API request in the background
    const lens = lenses.find(l => l.id === id);
    if (lens) {
      fetch('https://dashboard.flashailens.com/api/dashboard/updateDisplayValue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lensId: lens.lensId,
          isDisplayed: !lens.display,
          display: true,
          isBadge: false
        }),
      }).then(response => {
        if (!response.ok) {
          console.error('Failed to update display value');
          // Optionally, revert the change if the API call fails
        }
      }).catch(error => {
        console.error('Error updating display value:', error);
        // Optionally, revert the change if the API call fails
      });
    }
  }, [lenses]);

  const handleDisplayToggles = useCallback((id: number) => {
    setLenses(prevLenses => prevLenses.map(lens =>
      lens.id === id ? { ...lens, premiumLens: !lens.premiumLens } : lens
    ));

    // Send API request in the background
    const lens = lenses.find(l => l.id === id);
    if (lens) {
      fetch('https://dashboard.flashailens.com/api/dashboard/updateDisplayValue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lensId: lens.lensId,
          isDisplayed: !lens.premiumLens,
          display: false,
          isBadge: false
        }),
      }).then(response => {
        if (!response.ok) {
          console.error('Failed to update premium lens value');
          // Optionally, revert the change if the API call fails
        }
      }).catch(error => {
        console.error('Error updating premium lens value:', error);
        // Optionally, revert the change if the API call fails
      });
    }
  }, [lenses]);

  const handleBadgeToggle = useCallback((id: number) => {
    setLenses(prevLenses => prevLenses.map(lens =>
      lens.id === id ? { ...lens, badge: !lens.badge } : lens
    ));

    // Send API request in the background
    const lens = lenses.find(l => l.id === id);
    if (lens) {
      fetch('https://dashboard.flashailens.com/api/dashboard/updateDisplayValue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lensId: lens.lensId,
          isDisplayed: !lens.badge,
          display: false,
          isBadge: true
        }),
      }).then(response => {
        if (!response.ok) {
          console.error('Failed to update badge value');
          // Optionally, revert the change if the API call fails
        }
      }).catch(error => {
        console.error('Error updating badge value:', error);
        // Optionally, revert the change if the API call fails
      });
    }
  }, [lenses]);

  const handleBadgeTextSave = async (id: number, newValue: string) => {
    try {
      const lens = lenses.find(l => l.id === id);
      if (!lens) {
        console.error('Lens not found');
        return;
      }

      const formData = new FormData();
      formData.append('badgeText', newValue);

      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update badge text');
      }

      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, badgeText: newValue } : lens
      ));

      toast({
        title: "Success",
        description: "Badge text updated successfully",
      });
    } catch (error) {
      console.error('Error updating badge text:', error);
      toast({
        title: "Error",
        description: "Failed to update badge text. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLensInputChange = async (id: number, field: keyof Lens, value: string | number) => {
    if (field === 'promptgenerationflow') {
      handlePromptGenerationFlowChange(id, value as string);
    } else if (field === 'creditconsumption') {
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? {
          ...lens,
          [field]: typeof value === 'string' ? Number(value) : value
        } : lens
      ));

      try {
        await updateCreditConsumption(id, value as number);
      } catch (error) {
        console.error('Error updating credit consumption:', error);
        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, creditconsumption: lens.creditconsumption } : lens
        ));
        toast({
          title: "Error",
          description: "Failed to update credit consumption. Please try again.",
          variant: "destructive",
        });
      }
    } else if (field === 'imageToTextModel') {
      setLenses(lenses.map(lens =>
        lens.id === id ? { ...lens, [field]: typeof value === 'number' ? String(value) : value } : lens
      ));
      try {
        await updateImageToTextModel(id, value as string);

      } catch (error) {
        console.error('Error updating Image to Text Model:', error);
        toast({
          title: "Error",
          description: "Failed to update Image to Text Model. Please try again.",
          variant: "destructive",
        });
      }
    } else if (field === 'maxTokens') {
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? {
          ...lens,
          [field]: typeof value === 'string' ? Number(value) : value
        } : lens
      ));

      try {
        await updatemaxTokens(id, value as number);
      } catch (error) {
        console.error('Error updating maxTokens:', error);
        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, maxTokens: lens.maxTokens } : lens
        ));
        toast({
          title: "Error",
          description: "Failed to update maxTokens. Please try again.",
          variant: "destructive",
        });
      }
    } else if (field === 'textToImageModel') {
      setLenses(lenses.map(lens =>
        lens.id === id ? { ...lens, [field]: typeof value === 'number' ? String(value) : value } : lens
      ));
      try {
        await updatetextToImageModel(id, value as string);

      } catch (error) {
        console.error('Error updating text To Image Model:', error);
        toast({
          title: "Error",
          description: "Failed to update text To Image Model. Please try again.",
          variant: "destructive",
        });
      }
    } else if (field === 'prompt' || field === 'stylePrompt' || field === 'negativePrompt') {
      try {
        await updatePrompt(id, field, value as string);
        setLenses(lenses.map(lens =>
          lens.id === id ? { ...lens, [field]: value } : lens
        ));
      } catch (error) {
        console.error(`Error updating ${field}:`, error);
        throw error;
      }
    } else if (field === 'steps') {
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, steps: typeof value === 'string' ? parseInt(value) : value } : lens
      ));
      try {
        await updateSteps(id, value as number);
      } catch (error) {
        console.error('Error updating steps:', error);
        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, steps: lens.steps } : lens
        ));
        toast({
          title: "Error",
          description: "Failed to update steps. Please try again.",
          variant: "destructive",
        });
      }
    } else if (field === 'cfgScale') {
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, cfgScale: typeof value === 'string' ? parseFloat(value) : value } : lens
      ));
      try {
        await updateCfgScale(id, value as number);
      } catch (error) {
        console.error('Error updating CFG Scale:', error);
        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, cfgScale: lens.cfgScale } : lens
        ));
        toast({
          title: "Error",
          description: "Failed to update CFG Scale. Please try again.",
          variant: "destructive",
        });
      }
    } else if (field === 'Aproxtime') {
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, Aproxtime: value as string } : lens
      ));
      try {
        await updateAproxTime(id, value as string);
      } catch (error) {
        console.error('Error updating Aprox Time:', error);
        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, Aproxtime: lens.Aproxtime } : lens
        ));
        toast({
          title: "Error",
          description: "Failed to update Aprox Time. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setLenses(lenses.map(lens =>
        lens.id === id ? { ...lens, [field]: value } : lens
      ));
    }
  };

  const handlePromptGenerationFlowChange = async (id: number, value: string) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }
    console.log(lens);
    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updatePromptFlow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptFlow: value,
          lensId: lens.lensId // Use the lensId from the lens object
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update Prompt Generation Flow');
      }

      const result = await response.json();

      // Update the local state
      setLenses(lenses.map(l =>
        l.id === id ? { ...l, promptgenerationflow: value } : l
      ));

      toast({
        title: "Success",
        description: "Prompt Generation Flow updated successfully",
      });
    } catch (error) {
      console.error('Error updating Prompt Generation Flow:', error);
      toast({
        title: "Error",
        description: "Failed to update Prompt Generation Flow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateCreditConsumption = async (id: number, newValue: number) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('lensCredit', newValue.toString());

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update credit consumption');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Credit consumption updated successfully",
      });
    } catch (error) {
      console.error('Error updating credit consumption:', error);
      toast({
        title: "Error",
        description: "Failed to update credit consumption. Please try again.",
        variant: "destructive",
      });

      // Revert the local state change if the API call fails
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, creditconsumption: lens.creditconsumption } : lens
      ));
    }
  };

  const updateImageToTextModel = async (id: number, newValue: string) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('model', newValue);

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update Image to Text Model');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Image to Text Model updated successfully",
      });
    } catch (error) {
      console.error('Error updating Image to Text Model:', error);
      throw error;
    }
  };

  const updatemaxTokens = async (id: number, newValue: number) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('maxTokens', newValue.toString());

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update maxTokens!');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "maxTokens updated successfully",
      });
    } catch (error) {
      console.error('Error updating maxTokens:', error);
      toast({
        title: "Error",
        description: "Failed to update maxTokens. Please try again.",
        variant: "destructive",
      });

      // Revert the local state change if the API call fails
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, maxTokens: lens.maxTokens } : lens
      ));
    }
  };

  const updatetextToImageModel = async (id: number, newValue: string) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('imageModel', newValue);

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update text To Image Model');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Text To Image Model updated successfully",
      });
    } catch (error) {
      console.error('Error updating Text To Image Model:', error);
      throw error;
    }
  };

  const updatePrompt = async (id: number, field: 'prompt' | 'stylePrompt' | 'negativePrompt', newValue: string) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append(field, newValue);

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`);
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
      });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      throw error;
    }
  };

  const updateSteps = async (id: number, newValue: number) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('civitaiSteps', newValue.toString());

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update steps');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Steps updated successfully",
      });
    } catch (error) {
      console.error('Error updating steps:', error);
      throw error;
    }
  };

  const updateCfgScale = async (id: number, newValue: number) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('civitaiCFGScale', newValue.toString());

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update CFG Scale');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "CFG Scale updated successfully",
      });
    } catch (error) {
      console.error('Error updating CFG Scale:', error);
      throw error;
    }
  };

  const updateAproxTime = async (id: number, newValue: string) => {
    const lens = lenses.find(l => l.id === id);
    if (!lens) {
      console.error('Lens not found');
      return;
    }

    const formData = new FormData();
    formData.append('approxTime', newValue);

    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update Aprox Time');
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: "Aprox Time updated successfully",
      });
    } catch (error) {
      console.error('Error updating Aprox Time:', error);
      throw error;
    }
  };

  const handleCreditConsumptionSave = async (id: number, newValue: number) => {
    try {
      await updateCreditConsumption(id, newValue);
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, creditconsumption: newValue } : lens
      ));
      toast({
        title: "Success",
        description: "Credit consumption updated successfully",
      });
    } catch (error) {
      console.error('Error updating credit consumption:', error);
      toast({
        title: "Error",
        description: "Failed to update credit consumption. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMaxTokensSave = async (id: number, newValue: number) => {
    try {
      await updatemaxTokens(id, newValue);
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, maxTokens: newValue } : lens
      ));
      toast({
        title: "Success",
        description: "Max tokens updated successfully",
      });
    } catch (error) {
      console.error('Error updating max tokens:', error);
      toast({
        title: "Error",
        description: "Failed to update max tokens. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStepsSave = async (id: number, newValue: number) => {
    try {
      await updateSteps(id, newValue);
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, steps: newValue } : lens
      ));
      toast({
        title: "Success",
        description: "Steps updated successfully",
      });
    } catch (error) {
      console.error('Error updating steps:', error);
      toast({
        title: "Error",
        description: "Failed to update steps. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCfgScaleSave = async (id: number, newValue: number) => {
    try {
      await updateCfgScale(id, newValue);
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, cfgScale: newValue } : lens
      ));
      toast({
        title: "Success",
        description: "CFG Scale updated successfully",
      });
    } catch (error) {
      console.error('Error updating CFG Scale:', error);
      toast({
        title: "Error",
        description: "Failed to update CFG Scale. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAproxTimeSaves = async (id: number, newAproxTime: string) => {
    try {
      await updateAproxTime(id, newAproxTime);
      setLenses(prevLenses => prevLenses.map(lens =>
        lens.id === id ? { ...lens, Aproxtime: newAproxTime } : lens
      ));
      toast({
        title: "Success",
        description: "Aprox Time updated successfully",
      });
    } catch (error) {
      console.error('Error updating Aprox Time:', error);
      toast({
        title: "Error",
        description: "Failed to update Aprox Time. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLens = useCallback((id: number) => {
    const lensToCopy = lenses.find(lens => lens.id === id)
    if (lensToCopy) {
      setSelectedLens(lensToCopy)
      setIsCopyModalOpen(true)
    }
  }, [lenses])

  const handleConfirmCopy = async (updatedLens: Lens) => {
    setIsLoading(true)
    try {
      const newLens: Lens = {
        ...updatedLens,
        id: Math.floor(Math.random() * 1000000000),
        name: `${updatedLens.name}`,
        createdAt: new Date().toISOString(),
        lastUpdate: new Date(),
        usageCount: 0,
      }

      const dtaba = {
        lensId:  String(updatedLens.lensId),
        // _id: updatedLens.id,
        lensName: String(updatedLens.name),
        // createdAt: new Date().toISOString(),
        // updatedAt: new Date(),
        display:  String(updatedLens.display), 
        premiumLens:  String(updatedLens.premiumLens), 
        image:  String(updatedLens.image), 
        imageModel:  String(updatedLens.textToImageModel),
        isUpscale: updatedLens.isUpscale ?  String(updatedLens.isUpscale) : '', 
        leonardoModelId: updatedLens.leonardoModelId ? String(updatedLens.leonardoModelId) : '', 
        maxTokens:  String(updatedLens.maxTokens), 
        model:  String(updatedLens.imageToTextModel),
        prompt:  String(updatedLens.prompt), 
        lastPrompt: updatedLens.lastPrompt ? String(updatedLens.lastPrompt) : '',
        stylePrompt:  String(updatedLens.stylePrompt), 
        quality: updatedLens.quality ? String(updatedLens.quality) : '',
        systemPrompt: updatedLens.systemPrompt ?  String(updatedLens.systemPrompt) :'',
        lensCredit:  String(updatedLens.creditconsumption), 
        promptFlow:  String(updatedLens.promptgenerationflow), 
        upscaleKey: updatedLens.upscaleKey ?  String(updatedLens.upscaleKey) : '', 
        negativePrompt:  String(updatedLens.negativePrompt),
        civitaiSampler: updatedLens.civitaiSampler ? String(updatedLens.civitaiSampler) : '', 
        civitaiSeed: updatedLens.civitaiSeed ? String(updatedLens.civitaiSeed):'', 
        civitaiAspectRatio: updatedLens.civitaiAspectRatio ?  String(updatedLens.civitaiAspectRatio) : '', 
        civitaiLoraModel: updatedLens.civitaiLoraModel ? String(updatedLens.civitaiLoraModel) : '',
        civitaiSteps: String(updatedLens.steps), 
        civitaiCFGScale: String(updatedLens.cfgScale), 
        ModelsLabLoraModel: [] , 
        embeddingModel: [],
        sampler: updatedLens.sampler ?  String(updatedLens.sampler) : '',
        order:updatedLens.order ? String(updatedLens.order) : '', 
        // lensUses: String(updatedLens.usageCount),
        // dislikeFeedbackCount: updatedLens.dislikeFeedbackCount ? String(updatedLens.dislikeFeedbackCount) : '', 
        approxTime:String(updatedLens.Aproxtime), 
        // dislikeRate: updatedLens.dislikeRate ? String(updatedLens.dislikeRate) : '', 
        negativeKeyReplace: [],
        badgeText: updatedLens.badgeText ? String(updatedLens.badgeText) :'', 
        badge: String(updatedLens.badge), 
        // isDeleted: false, 
        // __v: 0, 
        isProduction: false
      }
      // API call to create new lens
      const response = await fetch('https://dashboard.flashailens.com/api/dashboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dtaba)
      })

      if (!response.ok) {
        throw new Error('Failed to copy lens')
      }

      // Update local state
      setLenses(prevLenses => [newLens, ...prevLenses])

      toast({
        title: "Success",
        description: "Lens copied successfully",
      })
      setIsCopyModalOpen(false)
      await fetchLensData()
    } catch (error) {
      console.error('Error copying lens:', error)
      toast({
        title: "Error",
        description: "Failed to copy lens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleliveCopyLens = useCallback(async (id: number) => {
    setIsLoading(true)
    debugger;
    try {
      const lensToCopy = lenses.find(lens => lens.id === id);
      if (lensToCopy) {
        const newLens: Lens = {
          ...lensToCopy,
          id: Math.floor(Math.random() * 1000000000),
          name: `${lensToCopy.name}`,
          createdAt: new Date().toISOString(),
          lastUpdate: new Date(),
          usageCount: 0,
        }
        
        const negativeKeywordsResponse = await fetch(`https://dashboard.flashailens.com/api/dashboard/getNegativeReplaceData/${lensToCopy.lensId}`);
      if (!negativeKeywordsResponse.ok) {
        throw new Error('Failed to fetch negative keywords');
      }
      const negativeKeywordsData = await negativeKeywordsResponse.json();

      // Extract the negativeKeyReplace array from the response
      const negativeKeywords = negativeKeywordsData.data?.negativeKeyReplace || [];

        const dtaba = {
          lensId:  String(lensToCopy.lensId),
          // _id: lensToCopy.id,
          lensName: String(lensToCopy.name),
          // createdAt: new Date().toISOString(),
          // updatedAt: new Date(),
          display:  String(lensToCopy.display), 
          premiumLens:  String(lensToCopy.premiumLens), 
          image:  String(lensToCopy.image), 
          imageModel:  String(lensToCopy.textToImageModel),
          isUpscale: lensToCopy.isUpscale ?  String(lensToCopy.isUpscale) : '', 
          leonardoModelId: lensToCopy.leonardoModelId ? String(lensToCopy.leonardoModelId) : '', 
          maxTokens:  String(lensToCopy.maxTokens), 
          model:  String(lensToCopy.imageToTextModel),
          prompt:  String(lensToCopy.prompt), 
          lastPrompt: lensToCopy.lastPrompt ? String(lensToCopy.lastPrompt) : '',
          stylePrompt:  String(lensToCopy.stylePrompt), 
          quality: lensToCopy.quality ? String(lensToCopy.quality) : '',
          systemPrompt: lensToCopy.systemPrompt ?  String(lensToCopy.systemPrompt) :'',
          lensCredit:  String(lensToCopy.creditconsumption), 
          promptFlow:  String(lensToCopy.promptgenerationflow), 
          upscaleKey: lensToCopy.upscaleKey ?  String(lensToCopy.upscaleKey) : '', 
          negativePrompt:  String(lensToCopy.negativePrompt),
          civitaiSampler: lensToCopy.civitaiSampler ? String(lensToCopy.civitaiSampler) : '', 
          civitaiSeed: lensToCopy.civitaiSeed ? String(lensToCopy.civitaiSeed):'', 
          civitaiAspectRatio: lensToCopy.civitaiAspectRatio ?  String(lensToCopy.civitaiAspectRatio) : '', 
          civitaiLoraModel: lensToCopy.civitaiLoraModel ? String(lensToCopy.civitaiLoraModel) : '',
          civitaiSteps: String(lensToCopy.steps), 
          civitaiCFGScale: String(lensToCopy.cfgScale), 
          ModelsLabLoraModel: [] , 
          embeddingModel: [],
          sampler: lensToCopy.sampler ?  String(lensToCopy.sampler) : '',
          order:lensToCopy.order ? String(lensToCopy.order) : '', 
          // dislikeFeedbackCount: lensToCopy.dislikeFeedbackCount ? String(lensToCopy.dislikeFeedbackCount) : '', 
          approxTime:String(lensToCopy.Aproxtime), 
          // dislikeRate: lensToCopy.dislikeRate ? String(lensToCopy.dislikeRate) : '', 
          negativeKeyReplace: negativeKeywords.map((keyword: any) => ({
            negativeKeyword: keyword.negativeKeyword,
            replaceNegativeKeywords: keyword.replaceNegativeKeywords,
          })),
          badgeText: lensToCopy.badgeText ? String(lensToCopy.badgeText) :'', 
          badge: String(lensToCopy.badge), 
          // isDeleted: false, 
          // __v: 0, 
          isProduction: true
        }
        
        const response = await fetch('https://flashailens.com/api/dashboard', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(dtaba)
        })

        if (!response.ok) {
          throw new Error('Failed to copy lens')
        }

        // Update the local state
        setLenses(prevLenses => [newLens, ...prevLenses])

        toast({
          title: "Success",
          description: "Lens copied successfully",
        })
      }
    } catch (error) {
      console.error('Error copying lens:', error)
      toast({
        title: "Error",
        description: "Failed to copy lens. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [lenses])

  const handleEditNegative = useCallback((lensId: string) => {
    setEditingLensId(lensId);
    setIsEditNegativePromptModalOpen(true);
  }, []);

  const handleDeleteLens = async (id: number) => {
    try {
      // Find the lens to get its _id
      const lensToDelete = lenses.find(lens => lens.id === id)
      console.log(lensToDelete);
      
      if (!lensToDelete) {
        throw new Error('Lens not found')
      }
      const dtaba = {
        id: lensToDelete.id
      }
      // Make the API call to delete the lens
      const response = await fetch('https://dashboard.flashailens.com/api/dashboard/removeData', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dtaba)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete lens')
      }

      // If successful, update the local state
      setLenses(prevLenses => prevLenses.filter(lens => lens.id !== id))

      // Show success message
      toast({
        title: "Success",
        description: "Lens deleted successfully",
      })
    } catch (error) {
      console.error('Error deleting lens:', error)
      
      // Show error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete lens. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleMoveLens = useCallback(async (id: number, direction: 'up' | 'down') => {
    setMovingLens(id);
    const index = lenses.findIndex(lens => lens.id === id);
    console.log(index);
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < lenses.length - 1)
    ) {
      const newLenses = [...lenses];
      const [removed] = newLenses.splice(index, 1);
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      newLenses.splice(newIndex, 0, removed);
      // Update the order property for the moved lens and the one it swapped with
      const movedLens = newLenses[newIndex];
      const movedLenss = newLenses[newIndex];
      const swappedLens = newLenses[direction === 'up' ? newIndex + 1 : newIndex - 1];
      const swappedLenss = newLenses[direction === 'up' ? newIndex + 1 : newIndex - 1];
      console.log(movedLens);
      console.log(swappedLens);
      movedLens.order = newIndex + 1;
      movedLenss.order = newIndex;
      swappedLens.order = index + 1;
      swappedLenss.order = index;
      // setLenses(newLenses);
      try {
        await updateLensOrder(movedLens.lensId, movedLenss.order);  
        await updateLensOrder(swappedLens.lensId, swappedLenss.order);
        toast({
          title: "Success",
          description: "Lens order updated successfully",
        });
        setLenses(newLenses);
      } catch (error) {
        console.error('Error updating lens order:', error);
        toast({
          title: "Error",
          description: "Failed to update lens order. Please try again.",
          variant: "destructive",
        });
        // Revert the change if the API call fails
        setLenses(lenses);
      }
    }
    setMovingLens(null);
  }, [lenses, toast]);

  const updateLensOrder = async (id: string, newOrder: number) => {
    debugger;
    const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updateOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lensId: id, order: newOrder }),
    });

    if (!response.ok) {
      throw new Error('Failed to update lens order');
    }

    return await response.json();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if ((email === "nori@dashboard.com" && password === "10312024") ||
      (email === "nayan@dashboard.com" && password === "7069112010")) {
      console.log('Login successful');
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('email', email);
      toast({
        title: "Login Successful",
        description: "Welcome to the AI Lens Management Dashboard!",
      });
    } else {
      console.log('Login failed');
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    console.log('Logging out');
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('email');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

 
  const handleSchedulePublishTime = useCallback(async (id: number, newDate: Date | undefined) => {
    try {
      const lens = lenses.find(l => l.id === id);
      if (!lens) {
        throw new Error('Lens not found');
      }

      if (newDate) {
        const formattedDate = format(newDate, "yyyy-MM-dd")
        const formattedTime = format(newDate, "hh:mm a")
        
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updateScheduleTime', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lensId: lens.lensId,
            scheduleLensPublishTime: `${formattedDate} ${formattedTime}`,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update scheduled publish time');
        }

        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, scheduledPublishTime: newDate.toISOString() } : lens
        ));

        toast({
          title: "Success",
          description: "Scheduled publish time updated successfully",
        });
      } else {
        const response = await fetch('https://dashboard.flashailens.com/api/dashboard/updateScheduleTime', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lensId: lens.lensId,
            scheduleLensPublishTime: null,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to clear scheduled publish time');
        }

        setLenses(prevLenses => prevLenses.map(lens =>
          lens.id === id ? { ...lens, scheduledPublishTime: null } : lens
        ));

        toast({
          title: "Success",
          description: "Scheduled publish time cleared successfully",
        });
      }
    } catch (error) {
      console.error('Error updating scheduled publish time:', error);
      toast({
        title: "Error",
        description: "Failed to update scheduled publish time. Please try again.",
        variant: "destructive",
      });
    }
  }, [lenses]);

  const ScheduledPublishTimeCellWrapper = useCallback(({ lens }: { lens: Lens }) => {
    return <ScheduledPublishTimeCell lens={lens} handleSchedulePublishTime={handleSchedulePublishTime} />
  }, [handleSchedulePublishTime])

  const MemoizedScheduledPublishTimeCell = useMemo(() => React.memo(ScheduledPublishTimeCellWrapper), [ScheduledPublishTimeCellWrapper])  

  const handleImageUpload = async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`https://dashboard.flashailens.com/api/dashboard/updateData/${id}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      const reader = new FileReader()
      reader.onload = (e) => {
        setLenses(lenses.map(lens =>
          lens.id === id ? { ...lens, image: e.target?.result as string | null } : lens
        ))
      }
      reader.readAsDataURL(file);
      // Toast message is now handled in the ImageUploadDialog component
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error; // Rethrow the error to be handled in the ImageUploadDialog
    }
  };

  interface PromptPopoverProps {
    value: string;
    onChange: (value: string) => void;
    title: string;
    id: number;
  }

  const PromptPopover: React.FC<PromptPopoverProps> = ({ value, onChange, title, id }) => {
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
        await onChange(tempValue);
        handleClose();
      } catch (error) {
        console.error('Error updating prompt:', error);
        toast({
          title: "Error",
          description: "Failed to update prompt. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Textarea
            className="max-width w-[250px] truncate resize-none latest-bio cursor-pointer"
            onClick={handleOpen}
            readOnly
            value={value || "Edit prompt"}
          />
        </PopoverTrigger>
        <PopoverContent className="w-[600px] mobile-de">
          <div className="grid gap-4">
            <h4 className="font-medium leading-none">{title}</h4>
            <Textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-12/12 latestes resize-none"
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  interface DeleteConfirmationProps {
    onConfirm: () => void;
  }

  const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ onConfirm }) => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to delete this lens?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the lens and remove its data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )

  interface ImageUploadDialogProps {
    lens: Lens;
    onUpload: (id: number, file: File) => Promise<void>;
  }

  const ImageUploadDialog: React.FC<ImageUploadDialogProps> = ({ lens, onUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
      }
    };

    const handleUpload = async () => {
      if (selectedFile) {
        setIsUploading(true);
        try {
          await onUpload(lens.id, selectedFile);
          setSelectedFile(null);
          toast({
            title: "Success",
            description: "Image uploaded successfully",
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          toast({
            title: "Error",
            description: "Failed to upload image. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      }
    };

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={lens.image || undefined} alt={lens.name} />
            <AvatarFallback>{lens.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </DialogTrigger>
        <DialogContent className='login-popup'>
          <DialogHeader>
            <DialogTitle>Upload Image for {lens.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="picture" className="text-right">
                Picture
              </Label>
              <Input
                id="picture"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpload} disabled={!selectedFile || isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  interface LensCardProps {
    lens: Lens;
    index: number;
    handleDisplayToggle: (id: number) => void;
    handleDisplayToggles: (id: number) => void;
    handleBadgeToggle: (id: number) => void;
    handleLensInputChange: (id: number, field: keyof Lens, value: string | number) => void;
    handleNameEdit: (id: number) => void;
    handleCopyLens: (id: number) => void;
    handleliveCopyLens: (id: number) => void;
    handleMoveLens: (id: number, direction: 'up' | 'down') => void;
    handleDeleteLens: (id: number) => void;
    handleNameSave: (id: number, newName: string) => Promise<void>;
    handleCreditConsumptionSave: (id: number, newValue: number) => Promise<void>;
    handleBadgeTextSave: (id: number, newValue: string) => Promise<void>;
    handleMaxTokensSave: (id: number, newValue: number) => Promise<void>;
    handleStepsSave: (id: number, newValue: number) => Promise<void>;
    handleCfgScaleSave: (id: number, newValue: number) => Promise<void>;
    handleAproxTimeSaves: (id: number, newValue: string) => Promise<void>;
    handleImageUpload: (id: number, file: File) => Promise<void>;
    editingId: number | null;
  }

  const LensCard: React.FC<LensCardProps> = ({
    lens,
    index,
    handleDisplayToggle,
    handleDisplayToggles,
    handleBadgeToggle,
    handleLensInputChange,
    handleCopyLens,
    handleliveCopyLens,
    handleMoveLens,
    handleDeleteLens,
    handleNameSave,
    handleCreditConsumptionSave,
    handleBadgeTextSave,
    handleMaxTokensSave,
    handleStepsSave,
    handleCfgScaleSave,
    handleAproxTimeSaves,
    handleImageUpload
  }) => (
    <Card className="mb-4 test">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <ImageUploadDialog
              lens={lens}
              onUpload={handleImageUpload}
            />
            <LensNameDialog
              lensName={lens.name}
              onSave={async (newName) => await handleNameSave(lens.id, newName)}
            />
          </span>
          {/* <div>
            <Switch className="mr-2"
              checked={lens.display}
              onCheckedChange={() => handleDisplayToggle(lens.id)}
            />
            <Switch
              checked={lens.premiumLens}
              onCheckedChange={() => handleDisplayToggles(lens.id)}
            />
          </div> */}

        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-muted-foreground">
            Last Update: {lens.lastUpdate.toLocaleDateString()}
          </div>
          <div className="text-sm font-medium">
            Usage: {lens.usageCount} times
          </div>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-5">
            <AccordionTrigger>Lens Display Condition</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Display </Label>
                  <Select
                    value={lens.display ? "true" : "false"} 
                    onValueChange={(value) => handleDisplayToggle(lens.id)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Display" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Premium</Label>
                  <Select
                    value={lens.premiumLens ? "true" : "false"}
                    onValueChange={(value) => handleDisplayToggles(lens.id)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Premium" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-1">
            <AccordionTrigger>Models and Tokens</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Credit Consumption</Label>
                  <NumberFieldDialog
                    fieldName="Credit Consumption"
                    value={lens.creditconsumption}
                    onSave={(newValue) => handleCreditConsumptionSave(lens.id, newValue)}
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">  Prompt Generation Flow</Label>
                  <Select
                    value={lens.promptgenerationflow}
                    onValueChange={(value) => handleLensInputChange(lens.id, 'promptgenerationflow', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flow B">Flow B</SelectItem>
                      <SelectItem value="Flow C">Flow C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Image to Text Model</Label>
                  <Select
                    value={lens.imageToTextModel}
                    onValueChange={(value) => handleLensInputChange(lens.id, 'imageToTextModel', value)}
                  >
                    <SelectTrigger className="w-full">
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
                <div>
                  <Label className="text-sm font-medium">Text to Image Model</Label>
                  <Select
                    value={lens.textToImageModel}
                    onValueChange={(value) => handleLensInputChange(lens.id, 'textToImageModel', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
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
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium">Max Tokens</Label>
                  <NumberFieldDialog
                    fieldName="Max Tokens"
                    value={lens.maxTokens}
                    onSave={(newValue) => handleMaxTokensSave(lens.id, newValue)}
                    min={1}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Prompts</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Prompt</Label>
                  <PromptPopover
                    value={lens.prompt}
                    onChange={(value) => handleLensInputChange(lens.id, 'prompt', value)}
                    title="Edit Prompt"
                    id={lens.id}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Style Prompt</Label>
                  <PromptPopover
                    value={lens.stylePrompt}
                    onChange={(value) => handleLensInputChange(lens.id, 'stylePrompt', value)}
                    title="Edit Style Prompt"
                    id={lens.id}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Negative Prompt</Label>
                  <PromptPopover
                    value={lens.negativePrompt}
                    onChange={(value) => handleLensInputChange(lens.id, 'negativePrompt', value)}
                    title="Edit Negative Prompt"
                    id={lens.id}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>Settings</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Steps: {lens.steps}</Label>
                  <Slider
                    value={[lens.steps]}
                    min={1}
                    max={100}
                    step={1}
                    onValueChange={(value) => handleLensInputChange(lens.id, 'steps', value[0])}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">CFG Scale: {lens.cfgScale}</Label>
                  <Slider
                    value={[lens.cfgScale]}
                    min={1}
                    max={20}
                    step={0.1}
                    onValueChange={(value) => handleLensInputChange(lens.id, 'cfgScale', value[0])}
                  />
                </div>
                <div className='d-none'>
                  <Label className="text-sm font-medium">Steps</Label>
                  <NumberFieldDialog
                    fieldName="Steps"
                    value={lens.steps}
                    onSave={(newValue) => handleStepsSave(lens.id, newValue)}
                    min={1}
                    max={100}
                    step={1}
                  />
                </div>
                <div className='d-none'>
                  <Label className="text-sm font-medium">CFG Scale</Label>
                  <NumberFieldDialog
                    fieldName="CFG Scale"
                    value={lens.cfgScale}
                    onSave={(newValue) => handleCfgScaleSave(lens.id, newValue)}
                    min={1}
                    max={20}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Aprox Time</Label>
                  <AproxTimeDialog
                    aproxTime={lens.Aproxtime}
                    onSave={(newValue) => handleAproxTimeSaves(lens.id, newValue)}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger>Badge Settings</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-4">
                <div>
                  <Label className="text-sm font-medium">Badge </Label>
                  <Select
                    value={lens.badge ? "true" : "false"}
                    onValueChange={(value) => handleBadgeToggle(lens.id)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Badge" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>

                </div>
                <div>
                  <Label className="text-sm font-medium">Badge Texts</Label>
                  <TextFieldDialog
                    fieldName="Badge Text"
                    value={lens.badgeText}
                    onSave={(newValue) => handleBadgeTextSave(lens.id, newValue)}
                    maxLength={50}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex justify-between mt-4 custom-flex-mobile">
          <Button variant="outline" size="icon" onClick={() => handleEditNegative(lens.lensId)}>
            N
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleCopyLens(lens.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleliveCopyLens(lens.id)}>
            <Copy className="h-4 w-4 mr-2" />
            Copy To Live
          </Button>
          <DeleteConfirmation onConfirm={() => handleDeleteLens(lens.id)} />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleMoveLens(lens.id, 'up')} 
            disabled={index === 0 || movingLens !== null}
          >
            {movingLens === lens.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoveUp className="h-4 w-4 mr-2" />
            )}
            Up
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleMoveLens(lens.id, 'down')} 
            disabled={index === lenses.length - 1 || movingLens !== null}
          >
            {movingLens === lens.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoveDown className="h-4 w-4 mr-2" />
            )}
            Down
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 margin-top">
      <Header
        isLoggedIn={isLoggedIn}
        email={email}
        handleLogout={handleLogout}
        handleLogin={handleLogin}
        setEmail={setEmail}
        setPassword={setPassword}
      />
      {editingLensId && (
        <EditNegativePromptModal
          isOpen={isEditNegativePromptModalOpen}
          onClose={() => setIsEditNegativePromptModalOpen(false)}
          lensId={editingLensId}
        // onSave={handleSaveNegativePrompt}
        />
      )}
      {selectedLens && (
        <CopyLensModal
          lens={selectedLens}
          isOpen={isCopyModalOpen}
          onClose={() => setIsCopyModalOpen(false)}
          onCopy={handleConfirmCopy}
        />
      )}
      {isLoggedIn && (
        <>
          <div className="mb-6 custom-flex d-none">
            <Label htmlFor="systemPrompt" className="text-lg font-medium">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter system prompt here..."
              className=""
            />
            <Button onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Submit"}
            </Button>

          </div>
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Lens Data</h2>
              <div className="space-x-2">
                <ModelDropdown onSelect={handleModelSelect} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
              <Select value={entriesPerPage} onValueChange={handleEntriesPerPageChange}>
                <SelectTrigger className="w-full sm:w-[180px] mb-2 sm:mb-0">
                  <SelectValue placeholder="Entries per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-8 w-full"
                />
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {/* Mobile view */}
              <div className="md:hidden">
                {lenses.map((lens, index) => (
                  <LensCard
                    key={lens.id}
                    lens={lens}
                    index={index}
                    handleDisplayToggle={handleDisplayToggle}
                    handleDisplayToggles={handleDisplayToggles}
                    handleBadgeToggle={handleBadgeToggle}
                    handleLensInputChange={handleLensInputChange}
                    handleCopyLens={handleCopyLens}
                    handleliveCopyLens={handleliveCopyLens}
                    handleMoveLens={handleMoveLens}
                    handleDeleteLens={handleDeleteLens}
                    handleNameEdit={handleNameEdit}
                    handleNameSave={handleNameSave}
                    handleCreditConsumptionSave={handleCreditConsumptionSave}
                    handleBadgeTextSave={handleBadgeTextSave}
                    handleMaxTokensSave={handleMaxTokensSave}
                    handleStepsSave={handleStepsSave}
                    handleCfgScaleSave={handleCfgScaleSave}
                    handleImageUpload={handleImageUpload}
                    handleAproxTimeSaves={handleAproxTimeSaves}
                    editingId={editingId}
                  />
                ))}
              </div>
              {/* Desktop view */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">No</TableHead>
                      <TableHead>Lens Icon</TableHead>
                      <TableHead>Lens Name</TableHead>
                      <TableHead>Display</TableHead>
                      <TableHead>Premium</TableHead>
                      <TableHead>Credit Use</TableHead>
                      <TableHead>Badge</TableHead>
                      <TableHead>Badge Text</TableHead>
                      <TableHead>Prompt gen flow</TableHead>
                      <TableHead>Image to Text</TableHead>
                      <TableHead>Max Tokens</TableHead>
                      <TableHead>Text to Image</TableHead>
                      <TableHead>Prompt</TableHead>
                      <TableHead>Style Prompt</TableHead>
                      <TableHead>Negative Prompt</TableHead>
                      <TableHead>Scheduled Publish Time</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead>CFG Scale</TableHead>
                      <TableHead>Approx Time</TableHead>
                      <TableHead>Usage Count</TableHead>
                      <TableHead>Last Update</TableHead>
                      <TableHead>Actions / Negative Keyword</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedLenses.map((lens, index) => (
                      <TableRow key={lens.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center w-[65px]">

                            <ImageUploadDialog
                              lens={lens}
                              onUpload={handleImageUpload}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-center  w-[150px] wi-conent">
                            <LensNameDialog
                              lensName={lens.name}
                              onSave={(newName) => handleNameSave(lens.id, newName)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={lens.display}
                            onCheckedChange={() => handleDisplayToggle(lens.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={lens.premiumLens}
                            onCheckedChange={() => handleDisplayToggles(lens.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <NumberFieldDialog
                            fieldName="Credit Consumption"
                            value={lens.creditconsumption}
                            onSave={(newValue) => handleCreditConsumptionSave(lens.id, newValue)}
                            min={0}
                          />
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={lens.badge}
                            onCheckedChange={() => handleBadgeToggle(lens.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextFieldDialog
                            fieldName="Badge Text"
                            value={lens.badgeText}
                            onSave={(newValue) => handleBadgeTextSave(lens.id, newValue)}
                            maxLength={50}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lens.promptgenerationflow}
                            onValueChange={(value) => handleLensInputChange(lens.id, 'promptgenerationflow', value)}
                          >
                            <SelectTrigger className="w-full w-[150px]">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Flow B">Flow B</SelectItem>
                              <SelectItem value="Flow C">Flow C</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lens.imageToTextModel}
                            onValueChange={(value) => handleLensInputChange(lens.id, 'imageToTextModel', value)}
                          >
                            <SelectTrigger className="w-[180px]">
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
                        </TableCell>

                        <TableCell>
                          <NumberFieldDialog
                            fieldName="Max Tokens"
                            value={lens.maxTokens}
                            onSave={(newValue) => handleMaxTokensSave(lens.id, newValue)}
                            min={1}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            value={lens.textToImageModel}
                            onValueChange={(value) => handleLensInputChange(lens.id, 'textToImageModel', value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select model" />
                            </SelectTrigger>
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
                          </Select>
                        </TableCell>
                        <TableCell>
                          <PromptPopover
                            value={lens.prompt}
                            onChange={(value) => handleLensInputChange(lens.id, 'prompt', value)}
                            title="Edit Prompt"
                            id={lens.id}
                          />
                        </TableCell>
                        <TableCell>
                          <PromptPopover
                            value={lens.stylePrompt}
                            onChange={(value) => handleLensInputChange(lens.id, 'stylePrompt', value)}
                            title="Edit Style Prompt"
                            id={lens.id}
                          />
                        </TableCell>
                        <TableCell>
                          <PromptPopover
                            value={lens.negativePrompt}
                            onChange={(value) => handleLensInputChange(lens.id, 'negativePrompt', value)}
                            title="Edit Negative Prompt"
                            id={lens.id}
                          />
                        </TableCell>
                        <TableCell>
                          <MemoizedScheduledPublishTimeCell lens={lens} />
                        </TableCell>
                        <TableCell>
                          <NumberFieldDialog
                            fieldName="Steps"
                            value={lens.steps}
                            onSave={(newValue) => handleStepsSave(lens.id, newValue)}
                            min={1}
                            max={100}
                            step={1}
                          />
                        </TableCell>
                        <TableCell>
                          <NumberFieldDialog
                            fieldName="CFG Scale"
                            value={lens.cfgScale}
                            onSave={(newValue) => handleCfgScaleSave(lens.id, newValue)}
                            min={1}
                            max={20}
                            step={0.1}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-items-center items-center w-[80px]">
                            <AproxTimeDialog
                              aproxTime={lens.Aproxtime}
                              onSave={(newValue) => handleAproxTimeSaves(lens.id, newValue)}
                            />
                          </div>
                        </TableCell>
                        <TableCell>{lens.usageCount}</TableCell>
                        <TableCell>{lens.lastUpdate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="icon" onClick={() => handleEditNegative(lens.lensId)}>
                              N
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => handleCopyLens(lens.id)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="outline"  onClick={() => handleliveCopyLens(lens.id)}>
                              <Copy className="h-4 w-4 mr-1" /> To Live
                            </Button>
                            <DeleteConfirmation onConfirm={() => handleDeleteLens(lens.id)} />
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleMoveLens(lens.id, 'up')} 
                                disabled={index === 0 || movingLens !== null}
                                aria-label="Move lens up"
                              >
                                {movingLens === lens.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoveUp className="h-4 w-4" />
                                )}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => handleMoveLens(lens.id, 'down')} 
                                disabled={index === lenses.length - 1 || movingLens !== null}
                                aria-label="Move lens down"
                              >
                                {movingLens === lens.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoveDown className="h-4 w-4" />
                                )}
                              </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              {entriesPerPage !== "All" && (
                <div className="flex justify-center mt-4 align-items-center">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="mx-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}