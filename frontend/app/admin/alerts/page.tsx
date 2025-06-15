"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Shield, UserX, Lock, Search, Filter } from "lucide-react"

interface Alert {
  id: number
  type: "security" | "access" | "suspicious" | "inactive"
  user: string
  message: string
  time: string
  date: string
  icon: React.ReactNode
  severity: "high" | "medium" | "low"
  status: "active" | "resolved"
}

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState("active")
  const [searchTerm, setSearchTerm] = useState("")

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "suspicious",
      user: "tech_ahmed",
      message: "Connexion depuis un nouvel appareil détectée (IP: 41.231.XX.XX)",
      time: "10:23",
      date: "11/05/2025",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      severity: "high",
      status: "active",
    },
    {
      id: 2,
      type: "access",
      user: "manager_sarah",
      message: "Tentatives multiples d'accès à la section admin (5 échecs)",
      time: "08:45",
      date: "11/05/2025",
      icon: <Lock className="h-5 w-5 text-orange-500" />,
      severity: "medium",
      status: "active",
    },
    {
      id: 3,
      type: "inactive",
      user: "tech_mohamed",
      message: "Compte inactif depuis 30 jours",
      time: "09:12",
      date: "10/05/2025",
      icon: <UserX className="h-5 w-5 text-yellow-500" />,
      severity: "low",
      status: "active",
    },
    {
      id: 4,
      type: "security",
      user: "tech_karim",
      message: "Connexion depuis un pays étranger (France)",
      time: "14:30",
      date: "09/05/2025",
      icon: <Shield className="h-5 w-5 text-red-500" />,
      severity: "high",
      status: "resolved",
    },
    {
      id: 5,
      type: "access",
      user: "manager_leila",
      message: "Tentative d'accès à des données sensibles sans autorisation",
      time: "11:05",
      date: "08/05/2025",
      icon: <Lock className="h-5 w-5 text-orange-500" />,
      severity: "medium",
      status: "resolved",
    },
  ])

  const handleLockAccount = (id: number) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, message: "Compte verrouillé par l'administrateur", severity: "low", status: "resolved" }
          : alert,
      ),
    )
  }

  const handleResolve = (id: number) => {
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, status: "resolved" } : alert)))
  }

  const handleDelete = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "low":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    // Filtrer par statut (onglet actif)
    const statusMatch = activeTab === "all" || alert.status === activeTab

    // Filtrer par terme de recherche
    const searchMatch =
      !searchTerm ||
      alert.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchTerm.toLowerCase())

    return statusMatch && searchMatch
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Alertes de sécurité</h1>
        <p className="text-gray-600">Gérez les alertes de sécurité et les activités suspectes</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-bold flex items-center">
            <Shield className="h-5 w-5 mr-2 text-red-500" />
            Alertes système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div className="relative w-full md:w-1/3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par utilisateur ou message..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList>
                  <TabsTrigger value="active">Actives</TabsTrigger>
                  <TabsTrigger value="resolved">Résolues</TabsTrigger>
                  <TabsTrigger value="all">Toutes</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="space-y-4">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Aucune alerte correspondant à vos critères</div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border ${getSeverityClass(alert.severity)} flex flex-col`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">{alert.icon}</div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h4 className="font-medium">Utilisateur: {alert.user}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            alert.status === "active" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                          }`}
                        >
                          {alert.status === "active" ? "Active" : "Résolue"}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {alert.date} à {alert.time}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-3">
                    {alert.status === "active" && (
                      <>
                        <Button variant="destructive" size="sm" onClick={() => handleLockAccount(alert.id)}>
                          Verrouiller le compte
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleResolve(alert.id)}>
                          Marquer comme résolu
                        </Button>
                      </>
                    )}
                    {alert.status === "resolved" && (
                      <Button variant="outline" size="sm" onClick={() => handleDelete(alert.id)}>
                        Supprimer
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
