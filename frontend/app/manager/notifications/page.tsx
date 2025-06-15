"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Notification {
  _id: string
  title: string
  message: string
  time: string
  isRead: boolean
  role: string
  userId: string
  createdAt: string
  updatedAt: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch notifications")
      }

      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      console.error("Error fetching notifications:", err)
      setError("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark notification as read")
      }

      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === id ? { ...notification, isRead: true } : notification
        )
      )
    } catch (err) {
      console.error("Error marking notification as read:", err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to mark all notifications as read")
      }

      // Update local state
      setNotifications(
        notifications.map((notification) => ({ ...notification, isRead: true }))
      )
    } catch (err) {
      console.error("Error marking all notifications as read:", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Format time as "il y a X minutes/heures/jours"
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: fr 
      })
    } catch (e) {
      return "Date inconnue"
    }
  }

  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.isRead
    if (activeTab === "read") return notification.isRead
    return true
  })

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <Button onClick={markAllAsRead} variant="outline">
          Tout marquer comme lu
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="unread">Non lues</TabsTrigger>
          <TabsTrigger value="read">Lues</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderNotifications(filteredNotifications, loading, error, markAsRead, formatTime)}
        </TabsContent>
        <TabsContent value="unread" className="mt-0">
          {renderNotifications(filteredNotifications, loading, error, markAsRead, formatTime)}
        </TabsContent>
        <TabsContent value="read" className="mt-0">
          {renderNotifications(filteredNotifications, loading, error, markAsRead, formatTime)}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function renderNotifications(
  notifications: Notification[],
  loading: boolean,
  error: string | null,
  markAsRead: (id: string) => void,
  formatTime: (dateString: string) => string
) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>
  }

  if (notifications.length === 0) {
    return <div className="text-center py-10 text-gray-500">Aucune notification</div>
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <div
          key={notification._id}
          className={`p-4 border rounded-lg ${!notification.isRead ? "bg-blue-50 border-blue-200" : "bg-white"}`}
          onClick={() => markAsRead(notification._id)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-lg">{notification.title}</h3>
              <p className="text-gray-600 mt-1">{notification.message}</p>
            </div>
            <div className="text-sm text-gray-500">{formatTime(notification.createdAt)}</div>
          </div>
          {!notification.isRead && (
            <div className="mt-2 flex justify-end">
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Non lu
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
