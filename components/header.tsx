"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function Header() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    router.push("/")
  }

  return (
    <header className="bg-[#1e56b0] text-white">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 relative">
            <Image
              src="/Frait-Logo.png"
              alt="FRAIT Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-medium hidden md:block">Health visitor control panel</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:text-white/90 hover:bg-white/10">
                {user?.username} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

