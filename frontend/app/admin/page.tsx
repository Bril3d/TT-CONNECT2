"use client"

import { useState, useEffect } from "react"
import { Users, UserCog, AlertTriangle, Activity, Clock, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define interfaces for our data types
interface SecurityAlert {
  title: string;
  message: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

interface ActivityItem {
  title: string;
  time: string;
  user?: string;
  type: 'create' | 'update' | 'delete';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    technicians: 0,
    managers: 0,
    activeAlerts: 0,
    pendingInterventions: 0,
    completedInterventions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      setError("")
      
      try {
        const token = localStorage.getItem("authToken")
        
        if (!token) {
          window.location.href = "/login"
          return
        }
        
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
        
        // Fetch users stats
        const usersResponse = await axios.get(`${API_URL}/users/stats`, config)
        
        // Fetch interventions stats
        const interventionsResponse = await axios.get(`${API_URL}/interventions/stats`, config)
        
        // Fetch alerts count
        const alertsResponse = await axios.get(`${API_URL}/notifications/alerts/count`, config)
        
        // Fetch recent activity
        const activityResponse = await axios.get(`${API_URL}/notifications/recent`, config)
        
        // Fetch security alerts
        const securityResponse = await axios.get(`${API_URL}/notifications/security`, config)
        
        setStats({
          totalUsers: usersResponse.data.totalUsers || 0,
          technicians: usersResponse.data.technicians || 0,
          managers: usersResponse.data.managers || 0,
          activeAlerts: alertsResponse.data.count || 0,
          pendingInterventions: interventionsResponse.data.pending || 0,
          completedInterventions: interventionsResponse.data.completed || 0,
        })
        
        setRecentActivity(activityResponse.data || [])
        setSecurityAlerts(securityResponse.data || [])
      } catch (err) {
        console.error("Error fetching dashboard data:", err)
        setError("Erreur lors du chargement des données")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord administrateur</h1>
        <p className="text-gray-600">Bienvenue dans votre portail d'administration</p>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Statistiques simplifiées sans composants externes */}
            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-800">
                  <Users className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Utilisateurs totaux</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalUsers}</p>
                  <p className="mt-1 text-sm text-gray-500">Tous les utilisateurs actifs</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-800">
                  <UserCog className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Techniciens</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.technicians}</p>
                  <p className="mt-1 text-sm text-gray-500">Techniciens sur le terrain</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-800">
                  <UserCog className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Managers</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.managers}</p>
                  <p className="mt-1 text-sm text-gray-500">Managers de site</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-800">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Alertes actives</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.activeAlerts}</p>
                  <p className="mt-1 text-sm text-gray-500">Alertes nécessitant attention</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-orange-100 text-orange-800">
                  <Clock className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Interventions en attente</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.pendingInterventions}</p>
                  <p className="mt-1 text-sm text-gray-500">Interventions planifiées</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-teal-100 text-teal-800">
                  <CheckCircle className="h-8 w-8" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500">Interventions terminées</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.completedInterventions}</p>
                  <p className="mt-1 text-sm text-gray-500">Ce mois-ci</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alertes de sécurité depuis l'API */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Alertes de sécurité
              </h3>
              <div className="space-y-4">
                {securityAlerts.length > 0 ? (
                  securityAlerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      alert.priority === 'high' ? 'bg-red-50 text-red-800' : 'bg-orange-50 text-orange-800'
                    }`}>
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(alert.time).toLocaleString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border bg-gray-50 text-gray-800">
                    <p className="text-sm">Aucune alerte de sécurité</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Activité récente depuis l'API */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Activité récente
              </h3>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start">
                      <div className={`mr-3 mt-0.5 ${
                        activity.type === 'create' ? 'text-green-500' : 
                        activity.type === 'update' ? 'text-blue-500' : 'text-purple-500'
                      }`}>•</div>
                      <div>
                        <p className="text-sm font-medium">{activity.title}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <span>{activity.user || 'Système'}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(activity.time).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border bg-gray-50">
                    <p className="text-sm">Aucune activité récente</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
