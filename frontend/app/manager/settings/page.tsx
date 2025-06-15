"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ManagerLayout } from "@/components/manager/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import {
  Sun,
  Palette,
  Bell,
  Shield,
  User,
  Save,
  RefreshCw,
  Languages,
  Smartphone,
  Laptop,
  Eye,
  EyeOff,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  // Settings state
  const [primaryColor, setPrimaryColor] = useState("orange")
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [language, setLanguage] = useState("fr")
  const [autoLogout, setAutoLogout] = useState(true)
  const [autoLogoutTime, setAutoLogoutTime] = useState("30")
  const [showSiteIds, setShowSiteIds] = useState(true)
  const [compactMode, setCompactMode] = useState(false)
  const [defaultView, setDefaultView] = useState("dashboard")

  // User profile state
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [position, setPosition] = useState("")
  const [department, setDepartment] = useState("")
  const [bio, setBio] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem("authToken")
    const userStr = localStorage.getItem("userData")

    if (!token || !userStr) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      // Vérifier si l'utilisateur est un manager
      if (user.role !== "Manager") {
        router.push("/login")
        return
      }

      setUserData(user)

      // Initialize user profile data
      setFullName(user.fullName || "Nidhal Nsiri")
      setEmail(user.email || "nidhal.nsiri@tunisietelecom.tn")
      setPhone(user.phone || "+216 98 765 432")
      setPosition(user.position || "Manager Régional")
      setDepartment(user.department || "Opérations Réseau")
      setBio(user.bio || "Manager régional responsable des opérations réseau pour la région de Tunis.")

      // Load settings from localStorage if available
      const savedSettings = localStorage.getItem("userSettings")
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setPrimaryColor(settings.primaryColor || "orange")
        setNotificationsEnabled(settings.notificationsEnabled !== false)
        setEmailNotifications(settings.emailNotifications !== false)
        setSmsNotifications(settings.smsNotifications || false)
        setLanguage(settings.language || "fr")
        setAutoLogout(settings.autoLogout !== false)
        setAutoLogoutTime(settings.autoLogoutTime || "30")
        setShowSiteIds(settings.showSiteIds !== false)
        setCompactMode(settings.compactMode || false)
        setDefaultView(settings.defaultView || "dashboard")
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [router])

  const saveAppearanceSettings = () => {
    // Apply theme
    document.documentElement.style.setProperty("--primary-color", primaryColor)

    // Apply theme class
    document.documentElement.classList.remove(
      "theme-orange",
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-red",
      "theme-gray",
    )
    document.documentElement.classList.add(`theme-${primaryColor}`)

    // Save settings to localStorage
    const settings = {
      primaryColor,
      theme,
      compactMode,
      showSiteIds,
      defaultView,
    }

    saveSettings(settings)

    toast({
      title: "Paramètres d'apparence enregistrés",
      description: "Vos préférences d'apparence ont été mises à jour avec succès.",
    })
  }

  const saveNotificationSettings = () => {
    // Save settings to localStorage
    const settings = {
      notificationsEnabled,
      emailNotifications,
      smsNotifications,
    }

    saveSettings(settings)

    toast({
      title: "Paramètres de notification enregistrés",
      description: "Vos préférences de notification ont été mises à jour avec succès.",
    })
  }

  const saveGeneralSettings = () => {
    // Save settings to localStorage
    const settings = {
      language,
      autoLogout,
      autoLogoutTime,
    }

    saveSettings(settings)

    toast({
      title: "Paramètres généraux enregistrés",
      description: "Vos paramètres généraux ont été mis à jour avec succès.",
    })
  }

  const saveProfileSettings = () => {
    // Update user data
    const updatedUser = {
      ...userData,
      fullName,
      email,
      phone,
      position,
      department,
      bio,
    }

    // Save to localStorage
    localStorage.setItem("adminUser", JSON.stringify(updatedUser))
    setUserData(updatedUser)

    toast({
      title: "Profil mis à jour",
      description: "Vos informations de profil ont été mises à jour avec succès.",
    })
  }

  const changePassword = () => {
    // Validation
    if (!currentPassword) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer votre mot de passe actuel.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive",
      })
      return
    }

    // In a real app, you would send this to your API
    // For this demo, we'll just show a success message

    toast({
      title: "Mot de passe modifié",
      description: "Votre mot de passe a été modifié avec succès.",
    })

    // Clear password fields
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  const saveSettings = (newSettings: any) => {
    // Get existing settings
    const existingSettingsStr = localStorage.getItem("userSettings")
    const existingSettings = existingSettingsStr ? JSON.parse(existingSettingsStr) : {}

    // Merge with new settings
    const mergedSettings = {
      ...existingSettings,
      ...newSettings,
    }

    // Save to localStorage
    localStorage.setItem("userSettings", JSON.stringify(mergedSettings))
  }

  const resetSettings = () => {
    // Reset to defaults
    setPrimaryColor("orange")
    setTheme("light")
    setNotificationsEnabled(true)
    setEmailNotifications(true)
    setSmsNotifications(false)
    setLanguage("fr")
    setAutoLogout(true)
    setAutoLogoutTime("30")
    setShowSiteIds(true)
    setCompactMode(false)
    setDefaultView("dashboard")

    // Clear settings from localStorage
    localStorage.removeItem("userSettings")

    // Reset theme classes
    document.documentElement.classList.remove(
      "theme-orange",
      "theme-blue",
      "theme-green",
      "theme-purple",
      "theme-red",
      "theme-gray",
    )
    document.documentElement.classList.add("theme-orange")
    document.documentElement.style.setProperty("--primary-color", "orange")

    toast({
      title: "Paramètres réinitialisés",
      description: "Tous les paramètres ont été réinitialisés aux valeurs par défaut.",
    })
  }

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
    <ManagerLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Paramètres</h2>
          <p className="text-muted-foreground">Gérez vos préférences et personnalisez votre expérience utilisateur.</p>
        </div>

        <Tabs defaultValue="appearance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          {/* Apparence */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>Personnalisez l'apparence de l'interface selon vos préférences.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sun className="h-5 w-5" />
                      <Label htmlFor="theme-toggle">Thème</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="theme-toggle" className={theme === "light" ? "font-medium" : ""}>
                        Clair
                      </Label>
                      <Switch
                        id="theme-toggle"
                        checked={theme === "dark"}
                        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      />
                      <Label htmlFor="theme-toggle" className={theme === "dark" ? "font-medium" : ""}>
                        Sombre
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Palette className="h-5 w-5" />
                      <Label>Couleur principale</Label>
                    </div>
                    <RadioGroup
                      value={primaryColor}
                      onValueChange={setPrimaryColor}
                      className="grid grid-cols-3 gap-4 pt-2"
                    >
                      <div>
                        <RadioGroupItem value="orange" id="color-orange" className="peer sr-only" aria-label="Orange" />
                        <Label
                          htmlFor="color-orange"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-orange-500 [&:has([data-state=checked])]:border-orange-500"
                        >
                          <div className="mb-2 h-5 w-5 rounded-full bg-orange-500" />
                          <span>Orange</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="blue" id="color-blue" className="peer sr-only" aria-label="Bleu" />
                        <Label
                          htmlFor="color-blue"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500"
                        >
                          <div className="mb-2 h-5 w-5 rounded-full bg-blue-500" />
                          <span>Bleu</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="green" id="color-green" className="peer sr-only" aria-label="Vert" />
                        <Label
                          htmlFor="color-green"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-green-500 [&:has([data-state=checked])]:border-green-500"
                        >
                          <div className="mb-2 h-5 w-5 rounded-full bg-green-500" />
                          <span>Vert</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="purple" id="color-purple" className="peer sr-only" aria-label="Violet" />
                        <Label
                          htmlFor="color-purple"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-purple-500 [&:has([data-state=checked])]:border-purple-500"
                        >
                          <div className="mb-2 h-5 w-5 rounded-full bg-purple-500" />
                          <span>Violet</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="red" id="color-red" className="peer sr-only" aria-label="Rouge" />
                        <Label
                          htmlFor="color-red"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-red-500 [&:has([data-state=checked])]:border-red-500"
                        >
                          <div className="mb-2 h-5 w-5 rounded-full bg-red-500" />
                          <span>Rouge</span>
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="gray" id="color-gray" className="peer sr-only" aria-label="Gris" />
                        <Label
                          htmlFor="color-gray"
                          className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-gray-500 [&:has([data-state=checked])]:border-gray-500"
                        >
                          <div className="mb-2 h-5 w-5 rounded-full bg-gray-500" />
                          <span>Gris</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-5 w-5" />
                      <Label htmlFor="compact-mode">Mode compact</Label>
                    </div>
                    <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-5 w-5" />
                      <Label htmlFor="show-site-ids">Afficher les IDs des sites</Label>
                    </div>
                    <Switch id="show-site-ids" checked={showSiteIds} onCheckedChange={setShowSiteIds} />
                  </div>

                  <div className="space-y-2 pt-4">
                    <div className="flex items-center space-x-2">
                      <Laptop className="h-5 w-5" />
                      <Label>Vue par défaut</Label>
                    </div>
                    <RadioGroup
                      value={defaultView}
                      onValueChange={setDefaultView}
                      className="grid grid-cols-2 gap-4 pt-2"
                    >
                      <div>
                        <RadioGroupItem value="dashboard" id="view-dashboard" className="peer sr-only" />
                        <Label
                          htmlFor="view-dashboard"
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Tableau de bord
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="interventions" id="view-interventions" className="peer sr-only" />
                        <Label
                          htmlFor="view-interventions"
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Interventions
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="sites" id="view-sites" className="peer sr-only" />
                        <Label
                          htmlFor="view-sites"
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Sites GSM
                        </Label>
                      </div>
                      <div>
                        <RadioGroupItem value="map" id="view-map" className="peer sr-only" />
                        <Label
                          htmlFor="view-map"
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          Carte des sites
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={resetSettings}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Réinitialiser
                  </Button>
                  <Button onClick={saveAppearanceSettings} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configurez comment et quand vous souhaitez recevoir des notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-5 w-5" />
                      <Label htmlFor="notifications-enabled">Activer les notifications</Label>
                    </div>
                    <Switch
                      id="notifications-enabled"
                      checked={notificationsEnabled}
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>

                  <div className="space-y-4 pl-7">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email-notifications">Notifications par email</Label>
                      <Switch
                        id="email-notifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                        disabled={!notificationsEnabled}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms-notifications">Notifications par SMS</Label>
                      <Switch
                        id="sms-notifications"
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                        disabled={!notificationsEnabled}
                      />
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <Label>Types de notifications</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-interventions" defaultChecked disabled={!notificationsEnabled} />
                        <Label htmlFor="notify-interventions">Nouvelles interventions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-status-changes" defaultChecked disabled={!notificationsEnabled} />
                        <Label htmlFor="notify-status-changes">Changements de statut</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-site-issues" defaultChecked disabled={!notificationsEnabled} />
                        <Label htmlFor="notify-site-issues">Problèmes sur les sites</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-reports" defaultChecked disabled={!notificationsEnabled} />
                        <Label htmlFor="notify-reports">Nouveaux rapports</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-system" defaultChecked disabled={!notificationsEnabled} />
                        <Label htmlFor="notify-system">Notifications système</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="notify-reminders" defaultChecked disabled={!notificationsEnabled} />
                        <Label htmlFor="notify-reminders">Rappels</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={saveNotificationSettings} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Général */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>Configurez les paramètres généraux de l'application.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue</Label>
                    <div className="flex items-center space-x-2">
                      <Languages className="h-5 w-5 text-gray-500" />
                      <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="fr">Français</option>
                        <option value="en">English</option>
                        <option value="ar">العربية</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <Label htmlFor="auto-logout">Déconnexion automatique</Label>
                    </div>
                    <Switch id="auto-logout" checked={autoLogout} onCheckedChange={setAutoLogout} />
                  </div>

                  <div className="pl-7 space-y-2">
                    <Label htmlFor="auto-logout-time">Délai d'inactivité (minutes)</Label>
                    <Input
                      id="auto-logout-time"
                      type="number"
                      min="5"
                      max="120"
                      value={autoLogoutTime}
                      onChange={(e) => setAutoLogoutTime(e.target.value)}
                      disabled={!autoLogout}
                      className="max-w-[100px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={saveGeneralSettings} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profil */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profil utilisateur</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <User className="h-12 w-12 text-gray-500" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Changer la photo</span>
                      </Button>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{fullName}</h3>
                      <p className="text-sm text-muted-foreground">{position}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nom complet</Label>
                      <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Poste</Label>
                      <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Département</Label>
                      <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Label htmlFor="bio">Biographie</Label>
                    <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button onClick={saveProfileSettings} className="bg-orange-500 hover:bg-orange-600">
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer le profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sécurité */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
                <CardDescription>Gérez vos paramètres de sécurité et changez votre mot de passe.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Changer le mot de passe</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Mot de passe actuel</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Le mot de passe doit contenir au moins 8 caractères.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button onClick={changePassword} className="bg-orange-500 hover:bg-orange-600">
                      Changer le mot de passe
                    </Button>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-medium mb-4">Sessions actives</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Session actuelle</p>
                          <p className="text-sm text-muted-foreground">Tunis, Tunisie • Chrome sur Windows</p>
                          <p className="text-xs text-muted-foreground">Dernière activité: Aujourd'hui à 15:30</p>
                        </div>
                        <Badge>Actif</Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 border rounded-md">
                        <div>
                          <p className="font-medium">Application mobile</p>
                          <p className="text-sm text-muted-foreground">Tunis, Tunisie • Application Android</p>
                          <p className="text-xs text-muted-foreground">Dernière activité: Hier à 09:45</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Déconnecter
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  )
}

function Pencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  )
}
