import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, UserPlus, Settings, FileText, LogIn } from "lucide-react"

interface ActivityItem {
  id: number
  action: string
  user: string
  time: string
  icon: React.ReactNode
}

export function RecentActivityCard() {
  const activities: ActivityItem[] = [
    {
      id: 1,
      action: "Nouvel utilisateur créé",
      user: "admin",
      time: "Il y a 30 minutes",
      icon: <UserPlus className="h-4 w-4 text-green-500" />,
    },
    {
      id: 2,
      action: "Paramètres système modifiés",
      user: "admin",
      time: "Il y a 2 heures",
      icon: <Settings className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 3,
      action: "Nouveau formulaire créé",
      user: "admin",
      time: "Il y a 5 heures",
      icon: <FileText className="h-4 w-4 text-purple-500" />,
    },
    {
      id: 4,
      action: "Connexion au système",
      user: "admin",
      time: "Il y a 1 jour",
      icon: <LogIn className="h-4 w-4 text-orange-500" />,
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="mr-3 mt-0.5">{activity.icon}</div>
              <div>
                <p className="text-sm font-medium">{activity.action}</p>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <span>Par {activity.user}</span>
                  <span className="mx-1">•</span>
                  <span>{activity.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
