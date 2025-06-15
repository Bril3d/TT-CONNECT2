"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Bell,
  Calendar, Home,
  LogOut, Radio, BarChart,
  Map,
  Plus
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

export function ManagerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [userData, setUserData] = useState<any>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get user data from localStorage
    const authToken = localStorage.getItem("authToken")
    const userStr = localStorage.getItem("userData")

    if (!authToken || !userStr) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      
      // Check if user is a manager
      if (user.role !== "Manager") {
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
      router.push("/manager/profile")
    } else if (action === "Paramètres") {
      router.push("/manager/settings")
    } else if (action === "Aide") {
      router.push("/manager/help")
    } else {
      toast({
        title: "Action de profil",
        description: `Vous avez sélectionné : ${action}`,
      })
    }
  }

  const handleNotifications = () => {
    router.push("/manager/notifications")
  }

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMobileMenuOpen(false)
  }
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData?.nom) return "M";
    
    const nameParts = userData.nom.split(" ");
    if (nameParts.length >= 2) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  };
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">

      {/* Mobile Menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-[250px] p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-orange-500">Tunisie Télécom GSM</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="grid gap-1 px-2">
                <button
                  onClick={() => handleNavigation("/manager")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/manager" ? "bg-orange-100 text-orange-500" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Home className="h-4 w-4" />
                  Tableau de bord
                </button>
                <button
                  onClick={() => handleNavigation("/manager/interventions")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname.startsWith("/manager/interventions") && pathname !== "/manager/interventions/planifier"
                      ? "bg-orange-100 text-orange-500"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Calendar className="h-4 w-4" />
                  Interventions
                </button>
                <button
                  onClick={() => handleNavigation("/manager/interventions/planifier")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md pl-9 ${
                    pathname === "/manager/interventions/planifier"
                      ? "bg-orange-100 text-orange-500"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Planifier une intervention
                </button>
                <button
                  onClick={() => handleNavigation("/manager/sites")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname.startsWith("/manager/sites")
                      ? "bg-orange-100 text-orange-500"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Radio className="h-4 w-4" />
                  Sites GSM
                </button>
                <button
                  onClick={() => handleNavigation("/manager/reports")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/manager/reports"
                      ? "bg-orange-100 text-orange-500"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <BarChart className="h-4 w-4" />
                  Rapports
                </button>
                <button
                  onClick={() => handleNavigation("/manager/map")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/manager/map"
                      ? "bg-orange-100 text-orange-500"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Map className="h-4 w-4" />
                  Carte des sites
                </button>
                <button
                  onClick={() => handleNavigation("/manager/notifications")}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                    pathname === "/manager/notifications"
                      ? "bg-orange-100 text-orange-500"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  Notifications
                </button>
              </nav>
            </div>
            <div className="border-t p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userData?.nom || "Manager"}</p>
                  <p className="text-xs text-muted-foreground">Manager</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleProfileAction("Déconnexion")
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-md w-full text-muted-foreground hover:bg-muted"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 mt-16">{children}</main>
      <Toaster />
    </div>
  )
}
