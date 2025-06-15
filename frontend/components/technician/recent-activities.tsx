"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, AlertTriangle, PenToolIcon as Tool } from "lucide-react"

// Mock data for activities
const initialActivities = [
  {
    id: "ACT-1001",
    type: "intervention_update",
    title: "Intervention mise à jour",
    description: "Intervention INT-2022 mise à jour - Statut changé à 'En cours'",
    timestamp: "25/05/2023 09:30",
    relatedId: "INT-2022",
    relatedName: "Mise à jour des équipements pour support 5G",
  },
  {
    id: "ACT-1002",
    type: "ticket_created",
    title: "Ticket créé",
    description: "Nouveau ticket TKT-1023 créé pour le site TUN-GSM-042",
    timestamp: "25/05/2023 14:30",
    relatedId: "TKT-1023",
    relatedName: "Panne d'alimentation",
  },
  {
    id: "ACT-1003",
    type: "intervention_completed",
    title: "Intervention terminée",
    description: "Intervention INT-2021 terminée avec succès",
    timestamp: "22/05/2023 13:45",
    relatedId: "INT-2021",
    relatedName: "Remplacement RRU défectueux",
  },
  {
    id: "ACT-1004",
    type: "ticket_updated",
    title: "Ticket mis à jour",
    description: "Ticket TKT-1022 mis à jour - Statut changé à 'En cours'",
    timestamp: "23/05/2023 11:30",
    relatedId: "TKT-1022",
    relatedName: "Dégradation du signal",
  },
  {
    id: "ACT-1005",
    type: "site_visited",
    title: "Site visité",
    description: "Visite effectuée au site NBL-GSM-073",
    timestamp: "22/05/2023 08:15",
    relatedId: "NBL-GSM-073",
    relatedName: "Nabeul Est",
  },
  {
    id: "ACT-1006",
    type: "equipment_checked",
    title: "Équipement vérifié",
    description: "Vérification de l'équipement ANT-007 sur le site NBL-GSM-073",
    timestamp: "22/05/2023 09:30",
    relatedId: "ANT-007",
    relatedName: "Antenne Ericsson AIR 3246",
  },
  {
    id: "ACT-1007",
    type: "ticket_resolved",
    title: "Ticket résolu",
    description: "Ticket TKT-1021 résolu - Problème de température résolu",
    timestamp: "22/05/2023 14:00",
    relatedId: "TKT-1021",
    relatedName: "Température élevée",
  },
]

export function RecentActivities() {
  const [activities, setActivities] = useState(initialActivities)
  const [typeFilter, setTypeFilter] = useState("all")

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "intervention_update":
      case "intervention_completed":
        return <Calendar className="h-5 w-5 text-blue-500" />
      case "ticket_created":
      case "ticket_updated":
      case "ticket_resolved":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "site_visited":
        return <Clock className="h-5 w-5 text-green-500" />
      case "equipment_checked":
        return <Tool className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityBadge = (type: string) => {
    switch (type) {
      case "intervention_update":
        return <Badge className="bg-blue-100 text-blue-800">Intervention</Badge>
      case "intervention_completed":
        return <Badge className="bg-green-100 text-green-800">Intervention</Badge>
      case "ticket_created":
        return <Badge className="bg-amber-100 text-amber-800">Ticket</Badge>
      case "ticket_updated":
        return <Badge className="bg-amber-100 text-amber-800">Ticket</Badge>
      case "ticket_resolved":
        return <Badge className="bg-green-100 text-green-800">Ticket</Badge>
      case "site_visited":
        return <Badge className="bg-purple-100 text-purple-800">Site</Badge>
      case "equipment_checked":
        return <Badge className="bg-orange-100 text-orange-800">Équipement</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Autre</Badge>
    }
  }

  const filteredActivities =
    typeFilter === "all"
      ? activities
      : activities.filter((activity) => {
          if (typeFilter === "interventions") {
            return activity.type.includes("intervention")
          } else if (typeFilter === "tickets") {
            return activity.type.includes("ticket")
          } else if (typeFilter === "sites") {
            return activity.type.includes("site")
          } else if (typeFilter === "equipment") {
            return activity.type.includes("equipment")
          }
          return true
        })

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activités Récentes</CardTitle>
            <CardDescription>Historique de vos activités récentes</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">Toutes les activités</option>
              <option value="interventions">Interventions</option>
              <option value="tickets">Tickets</option>
              <option value="sites">Sites</option>
              <option value="equipment">Équipements</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Aucune activité ne correspond à votre filtre</div>
          ) : (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-lg border p-4">
                <div className="flex-shrink-0">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {getActivityBadge(activity.type)}
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium">{activity.relatedId}</span>
                    <span className="text-xs text-muted-foreground">-</span>
                    <span className="text-xs text-muted-foreground">{activity.relatedName}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
