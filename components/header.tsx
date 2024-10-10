"use client"

import React, { useEffect, useState } from 'react'
import { Camera, LayoutDashboard, Menu, User, Zap,  Image, LogOut } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HeaderProps {
  isLoggedIn: boolean
  email: string
  handleLogout: () => void
  handleLogin: (e: React.FormEvent) => void
  setEmail: (email: string) => void
  setPassword: (password: string) => void
}

export default function Header({ isLoggedIn, email, handleLogout, handleLogin, setEmail, setPassword }: HeaderProps) {
  const [currentPage, setCurrentPage] = useState('main');
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      if (window.location.pathname === '/negative-analysis') {
        setCurrentPage('negative');
      } else if (window.location.pathname === '/image-gen-analysis') {
        setCurrentPage('image-gen');
      } else {
        setCurrentPage('main');
      }
    }
  }, []);

  const openPage = (page: string) => {
    if (isClient) {
      window.open(page, '_blank');
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  return (
    <header className="flex justify-between items-center fixed top-0 left-0 right-0 bg-background z-50 p-4 mnobile-flex-dev fixed_position-01">
      <h1 className="text-xl font-bold flex items-center">
        <Camera className="h-6 w-6 mr-2" />
        AI Lens Dashboard <small className="hidden sm:inline"> (Staging)</small>
      </h1>
      
      {isLoggedIn ? (
        <div className="flex items-center space-x-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className='border-none box-none' onClick={toggleMenu}>
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="py-4 flex flex-col space-y-4">
                <Button variant="outline" onClick={() => { openPage('https://flashailens.com/api/dashboard'); toggleMenu(); }}>
                    <Zap className="h-4 w-4 mr-2" />
                    Live Dashboard
                  </Button>
                {currentPage !== 'negative' && (
                  <Button variant="outline" onClick={() => { openPage('/negative-analysis'); toggleMenu(); }}>
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Negative Analysis
                  </Button>
                )}
                {currentPage !== 'image-gen' && (
                  <Button variant="outline" onClick={() => { openPage('/image-gen-analysis'); toggleMenu(); }}>
                    <Image className="h-4 w-4 mr-2"  />
                    Image Gen Analysis
                  </Button>
                )}
                {currentPage !== 'main' && (
                  <Button variant="outline" onClick={() => { window.location.href = '/'; toggleMenu(); }}>
                    Back to Main Dashboard
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                    Logout / {email}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="flex flex-col space-y-2">
                <p className="text-sm font-medium">{email}</p>
                <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-start">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <Dialog>
          <DialogTrigger asChild>
            <Button>Login</Button>
          </DialogTrigger>
          <DialogContent className="z-50 login-popup">
            <DialogHeader>
              <DialogTitle>Login</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleLogin}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Login</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </header>
  )
}