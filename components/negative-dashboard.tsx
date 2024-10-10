"use client"

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Circle, Zap, Clock, ChevronLeft, ChevronRight, User, Calendar as CalendarIcon, Search, Filter } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Header from './header'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"


interface FeedbackItem {
  _id: string
  feedback: string
  userId: {
    _id: string
    userName: string
  }
  postId: {
    generatedPrompt: string
    _id: string
    userId: {
      _id: string
      userName: string
    }
    name: string
    imageUrl: string
  }
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  message: string
  data: FeedbackItem[]
}

export default function NegativeFeedbackAnalysis() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('https://dashboard.flashailens.com/api/dislikeFeedBack/getAllDislikeData')
        const data: ApiResponse = await response.json()
        if (Array.isArray(data.data)) {
          setFeedbackData(data.data)
        } else {
          console.error('API response data is not an array:', data)
          setFeedbackData([])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch feedback data. Please try again later.",
          variant: "destructive",
        })
        setFeedbackData([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    
  }, [])

  const filteredFeedback = feedbackData.filter(item =>
    (item.userId?.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.postId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!selectedDate || new Date(item.createdAt).toDateString() === selectedDate.toDateString())
  )

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail("")
    setPassword("")
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('email')
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if ((email === "nori@dashboard.com" && password === "10312024") || 
        (email === "nayan@dashboard.com" && password === "7069112010")) {
      setIsLoggedIn(true)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('email', email)
      toast({
        title: "Login Successful",
        description: "Welcome to the AI Lens Management Dashboard!",
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn')
      const storedEmail = localStorage.getItem('email')
      
      if (loggedInStatus === 'true' && storedEmail) {
        setIsLoggedIn(true)
        setEmail(storedEmail)
      } else {
        setIsLoggedIn(false)
        setEmail('')
      }
    }

    checkLoginStatus()
    window.addEventListener('storage', checkLoginStatus)
    return () => {
      window.removeEventListener('storage', checkLoginStatus)
    }
  }, [])
  
  const totalPages = Math.ceil(filteredFeedback.length / itemsPerPage)
  const currentFeedback = filteredFeedback.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
 
  return (
    <div className="container mx-auto p-4 sm:p-6 margin-top-10">
      <Header 
        isLoggedIn={isLoggedIn}
        email={email}
        handleLogout={handleLogout}
        handleLogin={handleLogin}
        setEmail={setEmail}
        setPassword={setPassword}
      />  
      {isLoggedIn && ( 
        <>
          <Card>
            <CardHeader className='less-pad'>
              <CardTitle className="text-xl sm:text-2xl">Negative Feedback Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by user or lens name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="sm:hidden">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                        <SheetDescription>Adjust your view settings here.</SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? selectedDate.toDateString() : "Pick a date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                            />
                          </PopoverContent>
                        </Popover>
                        <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Items per page" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="8">8 per page</SelectItem>
                            <SelectItem value="16">16 per page</SelectItem>
                            <SelectItem value="32">32 per page</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </SheetContent>
                  </Sheet>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="hidden sm:flex">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? selectedDate.toDateString() : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                      />
                    </PopoverContent>
                  </Popover>
                  <div className="hidden sm:inline-flex">
                    <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Items per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8 per page</SelectItem>
                        <SelectItem value="16">16 per page</SelectItem>
                        <SelectItem value="32">32 per page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">Loading...</div>
              ) : feedbackData.length === 0 ? (
                <div className="text-center py-10">No feedback data available.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                 {currentFeedback.map((item) => (
                    <Card key={item._id} className="flex flex-col">
                      <CardContent className="p-3 sm:p-4 flex-grow">
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-center">
                            <div className="relative w-full aspect-[4/3] sm:aspect-square">
                              <Image
                                src={item.postId?.imageUrl || '/placeholder.svg'}
                                alt="Analyzed Image"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                                <AvatarFallback>
                                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" aria-label="AI Lens Icon" />
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-xs sm:text-sm">{item.postId?.name || 'Unnamed Lens'}</h3>
                                <div className="flex items-center space-x-1">
                                  <User className="h-2 w-2 sm:h-3 sm:w-3" />
                                  <p className="text-[10px] sm:text-xs text-muted-foreground">{item.userId?.userName || 'Unknown User'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-[10px] sm:text-xs">Feedback:</h4>
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{item.feedback || 'No feedback provided'}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-semibold text-[10px] sm:text-xs">Prompt:</h4>
                            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{item.postId?.generatedPrompt || 'No prompt available'}</p>
                          </div>
                          <div className="flex items-center space-x-1 text-[10px] sm:text-xs text-muted-foreground">
                            <Clock className="h-2 w-2 sm:h-3 sm:w-3" />
                            <span>{new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full mt-2">
                              Prompt & Feedback Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="login-popup sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] xl:max-w-[1000px]">
                              <DialogHeader>
                                <DialogTitle>Prompt & Feedback Details</DialogTitle>
                              </DialogHeader>
                              <div className="max-h-[63vh] overflow-y-auto">
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-semibold">Prompt:</h4>
                                    <p className="text-sm">{item.postId?.generatedPrompt || 'No prompt available'}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold">Feedback:</h4>
                                    <p className="text-sm">{item.feedback || 'No feedback provided'}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm">Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
    </div>
  )
}