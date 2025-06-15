"use client"

import { User, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { NotificationDropdown } from "@/components/ui/notification-dropdown"

interface HeaderProps {
  user: {
    id: string;
    nom: string;
    email: string;
    role: string;
    site: string;
    status: string;
  };
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    router.push("/login");
  };

  // Get the first letter of the user's name for the avatar
  const userInitial = user?.nom?.charAt(0) || "M";

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-end">
      <div className="flex items-center space-x-4">
        <NotificationDropdown role="Manager" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                {userInitial.toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <div className="font-medium">{user?.nom || "Manager"}</div>
                <div className="text-xs text-gray-500">{user?.role || "Manager"}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/manager/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Mon profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
              <User className="mr-2 h-4 w-4" />
              <span>Déconnexion</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
