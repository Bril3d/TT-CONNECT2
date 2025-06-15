import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardCardProps {
  title: string
  value: number
  icon: ReactNode
  description: string
  color: "blue" | "green" | "red" | "orange" | "purple" | "teal"
}

const colorMap = {
  blue: "bg-blue-100 text-blue-800",
  green: "bg-green-100 text-green-800",
  red: "bg-red-100 text-red-800",
  orange: "bg-orange-100 text-orange-800",
  purple: "bg-purple-100 text-purple-800",
  teal: "bg-teal-100 text-teal-800",
}

export function DashboardCard({ title, value, icon, description, color }: DashboardCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-full ${colorMap[color]}`}>{icon}</div>
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
