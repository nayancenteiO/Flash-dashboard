"use client"

import { useState, useEffect } from 'react'
import { Line, LineChart, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Calendar as CalendarIcon, DownloadIcon, FilterIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Header from './header'
import { toast } from "@/components/ui/use-toast"

import * as React from "react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"
 
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Mock data for demonstration
const mockData = [
  { date: '2023-06-01', users: 320 },
  { date: '2023-06-02', users: 340 },
  { date: '2023-06-03', users: 380 },
  { date: '2023-06-04', users: 330 },
  { date: '2023-06-05', users: 350 },
]

const countryData = [
  { name: 'USA', value: 400 },
  { name: 'UK', value: 300 },
  { name: 'Canada', value: 200 },
  { name: 'Australia', value: 100 },
  { name: 'Others', value: 150 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function Dashboard() {

    const [date, setDate] = React.useState<DateRange | undefined>({
        from: new Date(2022, 0, 20),
        to: addDays(new Date(2022, 0, 20), 20),
      })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(10000 / itemsPerPage)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

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
  
  return (
    <div className="flex flex-col space-y-4 p-8 margin-top-3">
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
                <div className="flex justify-between items-center custom-head">
                    <h1 className="text-3xl font-bold">iOS App Analytics Dashboard</h1>
                    <div className="flex space-x-2 mobile-flex-image">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                " justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline">
                            <FilterIcon className="mr-2 h-4 w-4" /> Filters
                        </Button>
                        <Button variant="outline">
                            <DownloadIcon className="mr-2 h-4 w-4" /> Export
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">10,234</div>
                            <p className="text-xs text-muted-foreground">+2.5% from last month</p>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 latest-chart-mat">
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Daily User Activity</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <ChartContainer
                                config={{
                                    users: {
                                    label: "Users",
                                    color: "hsl(var(--chart-1))",
                                    },
                                }}
                                className="h-[200px]  latest-chart"
                                >
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={mockData}>
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line type="monotone" dataKey="users" stroke="var(--color-users)" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>  
                        </Card>
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>Users by Country</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer
                                config={{
                                    value: {
                                    label: "Users",
                                    color: "hsl(var(--chart-1))",
                                    },
                                }}
                                className="h-[200px] latest-chart"
                                >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                    <Pie
                                        data={countryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {countryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                    </TabsContent>
                </Tabs>

                <Card>
                    <CardHeader>
                    <CardTitle>Detailed User Activity</CardTitle>
                    <CardDescription>A comprehensive view of user interactions with the app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                    <div className="flex justify-between mb-4 mobile-flex-dowen">
                        <div className="flex space-x-2">
                        <Input className="w-[300px]" placeholder="Search by User ID, Country, City..." />
                        </div>
                        <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </Button>
                        <div className="text-sm">
                            Page {currentPage} of {totalPages}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </Button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Timestamp</TableHead>
                            <TableHead>Country</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>User ID</TableHead>
                            <TableHead>Max token</TableHead>
                            <TableHead>Vision model</TableHead>
                            <TableHead>Lens name</TableHead>
                            <TableHead>Image gen model</TableHead>
                            <TableHead>Image gen type</TableHead>
                            <TableHead>Prompt</TableHead>
                            <TableHead>Image quality</TableHead>
                            <TableHead>System prompt</TableHead>
                            <TableHead>Style prompt</TableHead>
                            <TableHead>Negative prompt</TableHead>
                            <TableHead>Last prompt</TableHead>
                            <TableHead>Generated prompt</TableHead>
                            <TableHead>Final generated prompt</TableHead>
                            <TableHead>Prompt gen time</TableHead>
                            <TableHead>Image gen time</TableHead>
                            <TableHead>Input image resolution</TableHead>
                            <TableHead>Gen image resolution</TableHead>
                            <TableHead>Upscale</TableHead>
                            <TableHead>Upscale model</TableHead>
                            <TableHead>Upscale time</TableHead>
                            <TableHead>Input image size</TableHead>
                            <TableHead>Output image size</TableHead>
                            <TableHead>Total waiting time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 100 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        2023-06-{String(i + 1).padStart(2, '0')}
                                    </div>        
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        14:30:00
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[60px]'>
                                        USA
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        New York
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        user_{1000 + i}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        1024
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[90px]'>
                                        GPT-4 Vision
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        Wide Angle
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[118px]'>
                                        Stable Diffusion XL
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[106px]'>
                                        Text-to-Image
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        A futuristic cityscape
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        High
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[140px]'>
                                        Analyze the image
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[140px]'>
                                        Cyberpunk style
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[140px]'>
                                        Blurry, low quality
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[140px]'>
                                        Add flying cars
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[140px]'>
                                        Neon-lit skyscrapers
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[265px]'>
                                        Futuristic cityscape with flying cars and neon-lit skyscrapers
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        1.5s
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        3.7s
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        1024x1024
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        1024x1024
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        Yes
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        Real-ESRGAN
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        2.1s
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        2.5MB
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        5.8MB
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className='w-[80px]'>
                                        7.3s
                                    </div>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </div>
                    </CardContent>
                </Card>
            </>
        )}
    </div>
  )
}