"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  ChevronDown,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  Radio,
  User,
  AlertTriangle,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"
import NavbarBackground from "@/components/NavbarBackground"

export function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const authToken = localStorage.getItem("authToken")
    const userStr = localStorage.getItem("userData")

    if (!authToken || !userStr) {
      // Redirect to login if not authenticated
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)

      // Check if user is a technician
      if (user.role !== "Technicien") {
        router.push("/login")
        return
      }

      setUserData(user)
    } catch (error) {
      console.error("Error parsing user data:", error)
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")
      router.push("/login")
      return
    }

    setIsLoading(false)
  }, [router])

  const handleProfileAction = (action: string) => {
    if (action === "Déconnexion") {
      // Remove token from localStorage
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")

      // Show toast before redirect
      toast({
        title: "Déconnexion",
        description: "Vous avez été déconnecté avec succès.",
      })

      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 1000)
    } else if (action === "Profil") {
      router.push("/technician/profile")
    } else if (action === "Paramètres") {
      router.push("/technician/settings")
    } else if (action === "Aide") {
      router.push("/technician/help")
    } else {
      toast({
        title: "Action de profil",
        description: `Vous avez sélectionné : ${action}`,
      })
    }
  }

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "Vous avez consulté vos notifications.",
    })
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.nom) return "TT"

    const nameParts = userData.nom.split(" ")
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with dynamic background */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6 relative overflow-hidden">
        <div className="absolute inset-0">
          <NavbarBackground />
        </div>
        <div className="w-full flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-white" />
            <h1 className="text-xl font-semibold text-white">Tunisie Télécom GSM - Technicien</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-blue-700/50"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>

            {/* Desktop Navigation menu */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link
                href="/technician/interventions"
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  pathname === "/technician/interventions"
                    ? "bg-blue-700/50 text-white"
                    : "text-blue-50 hover:bg-blue-700/30 hover:text-white"
                }`}
              >
                Interventions
              </Link>
              <Link
                href="/technician/tickets"
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  pathname === "/technician/tickets"
                    ? "bg-blue-700/50 text-white"
                    : "text-blue-50 hover:bg-blue-700/30 hover:text-white"
                }`}
              >
                Tickets d'incidents
              </Link>
              <Link
                href="/technician/sites"
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  pathname === "/technician/sites"
                    ? "bg-blue-700/50 text-white"
                    : "text-blue-50 hover:bg-blue-700/30 hover:text-white"
                }`}
              >
                Sites assignés
              </Link>
            </nav>

            {/* Notifications */}
            <NotificationDropdown role="Technician" />

            {/* Profil utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 flex items-center gap-2 text-white hover:bg-blue-700/50"
                >
                  <Avatar className="h-8 w-8 border border-blue-300">
                    <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                    <AvatarFallback className="bg-blue-700 text-white">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline-flex text-sm font-medium">{userData?.nom || "Technicien"}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleProfileAction("Profil")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProfileAction("Aide")}>
                  <HelpCircle className="mr-2 h-4 w-4" />
                  <span>Aide</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleProfileAction("Déconnexion")}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[250px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b bg-gradient-to-r from-blue-900 to-blue-700">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-white" />
                <span className="font-semibold text-white">Tunisie Télécom GSM</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid gap-1 px-2">
                <button
                  onClick={() => handleNavigation("/technician")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/technician" ? "bg-blue-700 text-white" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Tableau de bord
                </button>
                <button
                  onClick={() => handleNavigation("/technician/interventions")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/technician/interventions"
                      ? "bg-blue-700 text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Interventions
                </button>
                <button
                  onClick={() => handleNavigation("/technician/tickets")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/technician/tickets"
                      ? "bg-blue-700 text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Tickets d'incidents
                </button>
                <button
                  onClick={() => handleNavigation("/technician/sites")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/technician/sites" ? "bg-blue-700 text-white" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Radio className="h-4 w-4" />
                  Sites assignés
                </button>
                <button
                  onClick={() => handleNavigation("/technician/reports")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/technician/reports"
                      ? "bg-blue-700 text-white"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  Rapports
                </button>
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8 border border-blue-300">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback className="bg-blue-700 text-white">{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userData?.nom || "Technicien"}</p>
                  <p className="text-xs text-muted-foreground">{userData?.email || "technicien@example.com"}</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2 border-blue-300 hover:bg-blue-50"
                onClick={() => handleProfileAction("Déconnexion")}
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main content */}
      <main className="flex-1 container mx-auto p-4 md:p-6">{children}</main>

      <Toaster />
    </div>
  )
}
