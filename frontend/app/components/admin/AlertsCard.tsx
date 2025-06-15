"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Shield, UserX, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Alert {
  id: number
  type: "security" | "access" | "suspicious"
  user: string
  message: string
  time: string
  icon: React.ReactNode
  severity: "high" | "medium" | "low"
}

export function AlertsCard() {
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "suspicious",
      user: "tech_ahmed",
      message: "Connexion depuis un nouvel appareil détectée",
      time: "Il y a 10 minutes",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      severity: "high",
    },
    {
      id: 2,
      type: "access",
      user: "manager_sarah",
      message: "Tentatives multiples d'accès à la section admin",
      time: "Il y a 2 heures",
      icon: <Lock className="h-5 w-5 text-orange-500" />,
      severity: "medium",
    },
    {
      id: 3,
      type: "security",
      user: "tech_mohamed",
      message: "Compte inactif depuis 30 jours",
      time: "Il y a 1 jour",
      icon: <UserX className="h-5 w-5 text-yellow-500" />,
      severity: "low",
    },
  ])

  const handleLockAccount = (id: number) => {
    // Simuler le verrouillage du compte
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, message: "Compte verrouillé par l'administrateur", severity: "low" } : alert,
      ),
    )
  }

  const handleDismiss = (id: number) => {
    // Supprimer l'alerte
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <Shield className="h-5 w-5 mr-2 text-red-500" />
          Alertes de sécurité
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6 text-gray-500">Aucune alerte de sécurité active</div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getSeverityClass(alert.severity)} flex flex-col`}>
                <div className="flex items-start">
                  <div className="mr-3 mt-0.5">{alert.icon}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">Utilisateur: {alert.user}</h4>
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-3">
                  <Button variant="destructive" size="sm" onClick={() => handleLockAccount(alert.id)}>
                    Verrouiller le compte
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDismiss(alert.id)}>
                    Ignorer
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
