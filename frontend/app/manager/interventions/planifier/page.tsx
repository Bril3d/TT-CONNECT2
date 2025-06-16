"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ManagerLayout } from "@/components/manager/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, Save, ArrowLeft, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"
import { Input } from "@/components/ui/input"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function PlanifierInterventionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState("09:00")
  const [type, setType] = useState<string>("maintenance")
  const [priority, setPriority] = useState<string>("medium")
  const [title, setTitle] = useState<string>("")
  const [siteId, setSiteId] = useState<string>("")
  const [selectedTechnician, setSelectedTechnician] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [tasks, setTasks] = useState<string>("")
  const [equipment, setEquipment] = useState<string>("")
  const [estimatedDuration, setEstimatedDuration] = useState<string>("1")

  // State for API data
  const [sites, setSites] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check authentication
        const token = localStorage.getItem("authToken")
        const userStr = localStorage.getItem("userData")

        if (!token || !userStr) {
          router.push("/login")
          return
        }

        try {
          const userData = JSON.parse(userStr)
          
          // Verify user is a Manager or Admin
          if (userData.role !== "Manager" && userData.role !== "Admin") {
            toast({
              title: "Accès refusé",
              description: "Vous n'avez pas les permissions nécessaires pour accéder à cette page.",
              variant: "destructive",
            })
            router.push("/login")
            return
          }
          
          // Fetch sites from API
          const sitesResponse = await axios.get(`${API_URL}/sites`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          setSites(sitesResponse.data)
          
          // Fetch technicians from API
          const techniciansResponse = await axios.get(`${API_URL}/users/role/Technicien`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          setTechnicians(techniciansResponse.data)
          
          setIsLoading(false)
        } catch (error) {
          console.error("Error parsing user data or fetching data:", error)
          router.push("/login")
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive",
        })
      }
    }

    fetchData()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    if (!date || !siteId || !selectedTechnician || !description || !title || !type || !priority) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Check if date is in the past
    const today = new Date(new Date().setHours(0, 0, 0, 0))
    if (date < today) {
      toast({
        title: "Erreur de validation",
        description: "La date d'intervention doit être supérieure à aujourd'hui.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      // Format date as YYYY-MM-DD
      const formattedDate = format(date, "yyyy-MM-dd")
      
      // Parse tasks and equipment
      const tasksList = tasks.trim() ? tasks.split('\n').map(task => ({
        description: task.trim(),
        completed: false
      })) : []
      
      const equipmentList = equipment.trim() 
        ? equipment.split('\n')
            .map(item => {
              const parts = item.trim().split(':')
              const name = parts[0].trim()
              const quantity = parts.length > 1 ? parseInt(parts[1].trim()) || 1 : 1
              return { name, quantity }
            })
            .filter(item => item.name !== '') // Filter out empty equipment names
        : []
      
      // Create intervention data
      const interventionData = {
        title,
        siteId,
        type,
        priority,
        status: "scheduled",
        description,
        scheduledDate: formattedDate,
        scheduledTime: time,
        estimatedDuration,
        assignedTechnicians: [selectedTechnician], // Single technician in an array
        tasks: tasksList,
        requiredEquipment: equipmentList
      }
      
      // Send data to backend API
      await axios.post(`${API_URL}/interventions`, interventionData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Show success message
      toast({
        title: "Intervention planifiée",
        description: "L'intervention a été planifiée avec succès.",
      })
      
      // Redirect to interventions list
      setTimeout(() => {
        router.push("/manager/interventions")
      }, 1500)
    } catch (error: any) {
      console.error("Error creating intervention:", error)
      
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la planification de l'intervention."
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Planifier une intervention</h2>
            <p className="text-muted-foreground">Créez une nouvelle intervention pour un site GSM</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/manager/interventions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Détails de l'intervention</CardTitle>
            <CardDescription>Renseignez les informations nécessaires pour planifier l'intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Titre de l'intervention <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Ex: Maintenance préventive - Site Tunis Centre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Date de l'intervention <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal" id="date">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar 
                        mode="single" 
                        selected={date} 
                        onSelect={setDate} 
                        initialFocus 
                        locale={fr}
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">
                    Heure de l'intervention <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">
                    Type d'intervention <span className="text-red-500">*</span>
                  </Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Réparation</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="upgrade">Mise à niveau</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">
                    Priorité <span className="text-red-500">*</span>
                  </Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Sélectionner une priorité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="critical">Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site">
                    Site <span className="text-red-500">*</span>
                  </Label>
                  <Select value={siteId} onValueChange={setSiteId}>
                    <SelectTrigger id="site">
                      <SelectValue placeholder="Sélectionner un site" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={site.id}>
                          {site.name} ({site.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">
                    Durée estimée (heures)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="technician">
                  Technicien assigné <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedTechnician} onValueChange={setSelectedTechnician}>
                  <SelectTrigger id="technician">
                    <SelectValue placeholder="Sélectionner un technicien" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.length > 0 ? (
                      technicians.map((tech) => (
                        <SelectItem key={tech._id} value={tech._id}>
                          {tech.nom}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>Aucun technicien disponible</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {!selectedTechnician && (
                  <p className="text-sm text-red-500">Veuillez assigner un technicien</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Description détaillée de l'intervention..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tasks">
                  Tâches à effectuer
                </Label>
                <Textarea
                  id="tasks"
                  placeholder="Liste des tâches à effectuer (une par ligne)..."
                  value={tasks}
                  onChange={(e) => setTasks(e.target.value)}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">Entrez une tâche par ligne</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="equipment">
                  Équipement requis
                </Label>
                <Textarea
                  id="equipment"
                  placeholder="Liste des équipements requis (un par ligne)..."
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Format: Nom de l'équipement: quantité (ex: Multimètre: 2)</p>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={() => router.push("/manager/interventions")}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange-500 hover:bg-orange-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Planification en cours...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Planifier l'intervention
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}
