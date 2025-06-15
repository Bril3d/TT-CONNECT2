"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ManagerLayout } from "@/components/manager/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { User, Mail, Phone, Shield, Bell, Save, Clock, Loader2, AlertCircle } from "lucide-react"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface UserData {
  _id: string;
  nom: string;
  email: string;
  username?: string | null;
  role: string;
  site: string;
  phone: string;
  bio: string;
  status: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

export default function ManagerProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
    position: "",
    bio: "",
    address: ""
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordError, setPasswordError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      // Vérifier si l'utilisateur est authentifié
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }

      try {
        // Fetch user data from API
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const user = response.data
        
        // Vérifier si l'utilisateur est un manager
        if (user.role !== "Manager") {
          router.push("/login")
          return
        }

        setUserData(user)
        
        // Set form data with user information
        setFormData({
          fullName: user.nom || "",
          email: user.email || "",
          username: user.username || "",
          phone: user.phone || "", // This field is not in the User model, so we use a placeholder
          position: user.role || "",
          bio: user.bio || "",
          address: user.site || "Tunis, Tunisie"
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        router.push("/login")
      }
    }

    fetchUserData()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [id]: value
    }))
    
    // Clear error when user starts typing again
    if (passwordError) {
      setPasswordError("")
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true)
      const token = localStorage.getItem("authToken")
      
      if (!token || !userData) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action.",
          variant: "destructive"
        })
        return
      }

      // Update user data using the new /auth/me endpoint
      const response = await axios.put(
        `${API_URL}/auth/me`, 
        {
          nom: formData.fullName,
          email: formData.email,
          username: formData.username,
          site: formData.address,
          phone: formData.phone,
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      // Update local user data with the response
      if (response.data && response.data.data) {
        setUserData(response.data.data)
        
        // Update form data to match the response
        setFormData(prev => ({
          ...prev,
          fullName: response.data.data.nom || prev.fullName,
          email: response.data.data.email || prev.email,
          username: response.data.data.username || "",
          address: response.data.data.site || prev.address
        }))
      }

      toast({
        title: "Profil mis à jour",
        description: "Vos informations de profil ont été mises à jour avec succès.",
      })
    } catch (error: any) {
      console.error("Error updating profile:", error)
      
      // Display more specific error message if available
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du profil."
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    // Reset error state
    setPasswordError("")
    
    // Validate passwords
    if (!passwordData.currentPassword) {
      setPasswordError("Le mot de passe actuel est requis")
      return
    }
    
    if (!passwordData.newPassword) {
      setPasswordError("Le nouveau mot de passe est requis")
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères")
      return
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      return
    }
    
    try {
      setIsUpdatingPassword(true)
      const token = localStorage.getItem("authToken")
      
      if (!token || !userData) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour effectuer cette action.",
          variant: "destructive"
        })
        return
      }
      
      // Send password update request
      await axios.put(
        `${API_URL}/auth/me`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Reset password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès.",
      })
    } catch (error: any) {
      console.error("Error updating password:", error)
      
      // Display more specific error message if available
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la mise à jour du mot de passe."
      setPasswordError(errorMessage)
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Format date to French locale
  function formatDate(dateString?: string) {
    if (!dateString) return null
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (e) {
      return dateString
    }
  }

  // Get initials from name
  function getInitials(name: string) {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profil Manager</h2>
          <p className="text-muted-foreground">Gérez vos informations personnelles et paramètres</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>Votre profil et vos coordonnées</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src="/placeholder.svg?height=128&width=128" alt="Photo de profil" />
                <AvatarFallback className="text-3xl bg-orange-100 text-orange-600">
                  {userData ? getInitials(userData.nom) : "NN"}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-bold">{userData?.nom || "Utilisateur"}</h3>
              <p className="text-sm text-muted-foreground mb-4">{userData?.role || "Manager"}</p>
              <div className="w-full space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ID: {userData?._id || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userData?.email || "email@example.com"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{userData?.phone || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Dernière connexion: {formatDate(userData?.lastLogin) || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>Gérez vos préférences et informations</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="general">Général</TabsTrigger>
                  <TabsTrigger value="security">Sécurité</TabsTrigger>
                 
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input 
                        id="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <Input 
                        id="username" 
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Nom d'utilisateur (optionnel)"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Poste</Label>
                      <Input 
                        id="position" 
                        value={formData.position}
                        disabled 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse</Label>
                      <Input 
                        id="address" 
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Biographie</Label>
                    <textarea
                      id="bio"
                      className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md"
                      value={formData.bio}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Enregistrer les modifications
                  </Button>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                      <Input 
                        id="currentPassword" 
                        type="password" 
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                      />
                    </div>
                    
                    {passwordError && (
                      <div className="bg-red-50 p-3 rounded-md flex items-start gap-2 text-red-800">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{passwordError}</p>
                      </div>
                    )}
                  </div>

                  <Button 
                    onClick={handleUpdatePassword} 
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    Mettre à jour le mot de passe
                  </Button>

                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="font-medium">Options de sécurité</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Authentification à deux facteurs</h4>
                        <p className="text-xs text-muted-foreground">
                          Ajouter une couche de sécurité supplémentaire à votre compte
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">Sessions actives</h4>
                        <p className="text-xs text-muted-foreground">Gérer vos sessions actives</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Gérer
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications par email</h3>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications par email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications dans l'application</h3>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications dans l'application</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Notifications SMS</h3>
                        <p className="text-sm text-muted-foreground">Recevoir des notifications par SMS</p>
                      </div>
                      <Switch />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <h3 className="font-medium">Types de notifications</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notif_interventions" defaultChecked />
                        <Label htmlFor="notif_interventions">Nouvelles interventions</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notif_tickets" defaultChecked />
                        <Label htmlFor="notif_tickets">Nouveaux tickets d'incidents</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notif_sites" defaultChecked />
                        <Label htmlFor="notif_sites">Mises à jour des sites</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="notif_reports" defaultChecked />
                        <Label htmlFor="notif_reports">Rapports disponibles</Label>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} className="bg-orange-500 hover:bg-orange-600">
                    <Bell className="h-4 w-4 mr-2" />
                    Enregistrer les préférences
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </ManagerLayout>
  )
}
