"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TechnicianLayout } from "@/components/technician/layout"
import { DashboardCard } from "@/components/technician/dashboard-card"
import { InterventionsList } from "@/components/technician/interventions-list"
import { TicketsList } from "@/components/technician/tickets-list"
import { RecentActivities } from "@/components/technician/recent-activities"
import { SitesList } from "@/components/technician/sites-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, PenToolIcon as Tool, AlertTriangle, Radio } from "lucide-react"

export default function TechnicianDashboard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check if user is authenticated as technician
    const token = localStorage.getItem("authToken")
    const userStr = localStorage.getItem("userData")

    if (!token || !userStr) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      // Verify if user is a technician
      if (user.role !== "Technicien") {
        router.push("/login")
        return
      }

      setUserData(user)
      setIsLoading(false)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [router])

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
    <TechnicianLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tableau de bord Technicien</h2>
          <p className="text-muted-foreground">
            Bienvenue, {userData?.fullName || "Technicien"}. Gérez vos interventions et tickets.
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Interventions Assignées"
            value="8"
            change="+2"
            changeType="increase"
            icon={<Calendar className="h-4 w-4 text-orange-500" />}
          />
          <DashboardCard
            title="Interventions En Cours"
            value="3"
            change="+1"
            changeType="increase"
            icon={<Tool className="h-4 w-4 text-blue-500" />}
          />
          <DashboardCard
            title="Tickets Ouverts"
            value="5"
            change="-2"
            changeType="decrease"
            icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          />
          <DashboardCard
            title="Sites Assignés"
            value="12"
            change="0"
            changeType="neutral"
            icon={<Radio className="h-4 w-4 text-green-500" />}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="interventions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="interventions">Interventions</TabsTrigger>
            <TabsTrigger value="tickets">Tickets d'Incidents</TabsTrigger>
            <TabsTrigger value="sites">Sites Assignés</TabsTrigger>
            <TabsTrigger value="activities">Activités Récentes</TabsTrigger>
          </TabsList>

          <TabsContent value="interventions" className="space-y-4">
            <InterventionsList />
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <TicketsList />
          </TabsContent>

          <TabsContent value="sites" className="space-y-4">
            <SitesList />
          </TabsContent>

          <TabsContent value="activities" className="space-y-4">
            <RecentActivities />
          </TabsContent>
        </Tabs>
      </div>
    </TechnicianLayout>
  )
}
