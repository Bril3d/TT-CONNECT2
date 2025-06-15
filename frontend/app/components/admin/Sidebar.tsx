"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  BarChart3,
} from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    users: true,
    reports: false,
  })

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }))
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    window.location.href = "/"
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-gray-800 text-white">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Admin Portal</h2>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          <Link
            href="/admin"
            className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
          >
            <Home className="mr-3 h-5 w-5" />
            Tableau de bord
          </Link>

          <div>
            <button
              onClick={() => toggleMenu("users")}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <div className="flex items-center">
                <Users className="mr-3 h-5 w-5" />
                <span>Utilisateurs</span>
              </div>
              {openMenus.users ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {openMenus.users && (
              <div className="pl-10 space-y-1 mt-1">
                <Link
                  href="/admin/users/new"
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin/users/new") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Ajouter un utilisateur
                </Link>
                <Link
                  href="/admin/users"
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin/users") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Gérer les utilisateurs
                </Link>
              </div>
            )}
          </div>



          <div>
            <button
              onClick={() => toggleMenu("reports")}
              className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md"
            >
              <div className="flex items-center">
                <FileText className="mr-3 h-5 w-5" />
                <span>Rapports</span>
              </div>
              {openMenus.reports ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {openMenus.reports && (
              <div className="pl-10 space-y-1 mt-1">
                <Link
                  href="/admin/reports/activity"
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin/reports/activity") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Activité utilisateurs
                </Link>
                <Link
                  href="/admin/reports/interventions"
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin/reports/interventions") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
                >
                  Interventions
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/admin/calendar"
            className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin/calendar") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Calendrier
          </Link>

          <Link
            href="/admin/analytics"
            className={`flex items-center px-4 py-2 text-sm rounded-md ${isActive("/admin/analytics") ? "bg-gray-900 text-orange-400" : "text-gray-300 hover:bg-gray-700"}`}
          >
            <BarChart3 className="mr-3 h-5 w-5" />
            Analytiques
          </Link>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <nav className="space-y-1">
          <Link
            href="/admin/help"
            className="flex items-center px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700"
          >
            <HelpCircle className="mr-3 h-5 w-5" />
            Aide
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-300 rounded-md hover:bg-gray-700 hover:text-red-400"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Déconnexion
          </button>
        </nav>
      </div>
    </div>
  )
}
