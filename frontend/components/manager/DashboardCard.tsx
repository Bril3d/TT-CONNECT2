import { Antenna, PenToolIcon as Tool, Clock, FileText, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardCardProps {
  title: string
  value: string
  change: string
  changeType: "increase" | "decrease" | "neutral"
  icon: "antenna" | "tool" | "clock" | "file-text"
}

export function DashboardCard({ title, value, change, changeType, icon }: DashboardCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "antenna":
        return <Antenna className="h-6 w-6 text-orange-500" />
      case "tool":
        return <Tool className="h-6 w-6 text-blue-500" />
      case "clock":
        return <Clock className="h-6 w-6 text-yellow-500" />
      case "file-text":
        return <FileText className="h-6 w-6 text-green-500" />
      default:
        return null
    }
  }

  const getChangeColor = () => {
    switch (changeType) {
      case "increase":
        return "text-green-600"
      case "decrease":
        return "text-red-600"
      case "neutral":
        return "text-gray-600"
      default:
        return "text-gray-600"
    }
  }

  const getChangeIcon = () => {
    switch (changeType) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />
      case "decrease":
        return <TrendingDown className="h-3 w-3" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            <div className={`flex items-center mt-1 text-xs ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1">{change} depuis le mois dernier</span>
            </div>
          </div>
          <div className="p-3 bg-gray-100 rounded-full">{getIcon()}</div>
        </div>
      </CardContent>
    </Card>
  )
}
