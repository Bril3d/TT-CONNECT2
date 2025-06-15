"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ManagerLayout } from "@/components/manager/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, Calendar, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function EditInterventionPage() {
  const router = useRouter()
  const params = useParams()
  const interventionId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [intervention, setIntervention] = useState<any>(null)

  // Form state
  const [title, setTitle] = useState("")
  const [siteId, setSiteId] = useState("")
  const [type, setType] = useState("")
  const [priority, setPriority] = useState("")
  const [status, setStatus] = useState("")
  const [description, setDescription] = useState("")
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [estimatedDuration, setEstimatedDuration] = useState("")
  const [assignedTechnician, setAssignedTechnician] = useState<string>("")
  const [requiredEquipment, setRequiredEquipment] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])

  // New equipment and task fields
  const [newEquipmentName, setNewEquipmentName] = useState("")
  const [newEquipmentQuantity, setNewEquipmentQuantity] = useState("1")
  const [newTaskDescription, setNewTaskDescription] = useState("")

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
          
          // Fetch intervention data from API
          const interventionResponse = await axios.get(`${API_URL}/interventions/${interventionId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })
          
          const interventionData = interventionResponse.data
          setIntervention(interventionData)
          
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
          
          // Initialize form with intervention data
          setTitle(interventionData.title)
          setSiteId(interventionData.siteId)
          setType(interventionData.type)
          setPriority(interventionData.priority)
          setStatus(interventionData.status)
          setDescription(interventionData.description)
          setScheduledDate(interventionData.scheduledDate)
          setScheduledTime(interventionData.scheduledTime)
          setEstimatedDuration(interventionData.estimatedDuration || "1")
          setAssignedTechnician(interventionData.assignedTechnicians?.[0] || "")
          setRequiredEquipment(interventionData.requiredEquipment || [])
          setTasks(interventionData.tasks || [])
          
          setIsLoading(false)
        } catch (error: any) {
          console.error("Error fetching data:", error)
          
          if (error.response?.status === 404) {
            toast({
              title: "Intervention non trouvée",
              description: "L'intervention demandée n'existe pas.",
              variant: "destructive",
            })
          } else {
            toast({
              title: "Erreur",
              description: "Impossible de charger les données de l'intervention.",
              variant: "destructive",
            })
          }
          
          setTimeout(() => {
            router.push("/manager/interventions")
          }, 1500)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        router.push("/login")
      }
    }

    fetchData()
  }, [router, interventionId])

  // Handle equipment
  const addEquipment = () => {
    if (!newEquipmentName.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nom d'équipement",
        variant: "destructive",
      })
      return
    }

    const newEquipment = {
      id: `eq-${Date.now()}`,
      name: newEquipmentName.trim(),
      quantity: Number.parseInt(newEquipmentQuantity) || 1,
    }

    setRequiredEquipment([...requiredEquipment, newEquipment])
    setNewEquipmentName("")
    setNewEquipmentQuantity("1")
  }

  const removeEquipment = (id: string) => {
    setRequiredEquipment(requiredEquipment.filter((eq) => eq.id !== id))
  }

  // Handle tasks
  const addTask = () => {
    if (!newTaskDescription.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une description de tâche",
        variant: "destructive",
      })
      return
    }

    const newTask = {
      id: `task-${Date.now()}`,
      description: newTaskDescription,
      completed: false,
    }

    setTasks([...tasks, newTask])
    setNewTaskDescription("")
  }

  const removeTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  // Handle technician selection
  const handleTechnicianChange = (techId: string) => {
    setAssignedTechnician(techId);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    if (!title || !siteId || !type || !priority || !status || !scheduledDate || !scheduledTime) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    if (!assignedTechnician) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez assigner un technicien.",
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
      
      // Create updated intervention object
      const updatedIntervention = {
        title,
        siteId,
        type,
        priority,
        status,
        description,
        scheduledDate,
        scheduledTime,
        estimatedDuration,
        assignedTechnicians: [assignedTechnician],
        requiredEquipment,
        tasks
      }
      
      // Send data to backend API
      await axios.put(`${API_URL}/interventions/${interventionId}`, updatedIntervention, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Show success message
      toast({
        title: "Intervention mise à jour avec succès",
        description: `L'intervention ${title} a été mise à jour.`,
      })
      
      // Redirect to interventions list
      setTimeout(() => {
        router.push("/manager/interventions")
      }, 1500)
    } catch (error: any) {
      console.error("Error updating intervention:", error)
      
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la mise à jour de l'intervention."
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const handleTaskStatusUpdate = async (taskId: string, completed: boolean) => {
    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      // Update task status on the API
      await axios.patch(
        `${API_URL}/interventions/${interventionId}/task`, 
        { taskId, completed },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update local state
      setTasks(tasks.map(task => 
        task._id === taskId ? { ...task, completed } : task
      ))
      
      toast({
        title: completed ? "Tâche complétée" : "Tâche réinitialisée",
        description: `La tâche a été marquée comme ${completed ? "complétée" : "non complétée"}.`,
      })
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la tâche.",
        variant: "destructive",
      })
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Modifier l'intervention {interventionId}</h2>
            <p className="text-muted-foreground">Modifiez les détails de l'intervention</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/manager/interventions")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="schedule">Planification</TabsTrigger>
              <TabsTrigger value="resources">Ressources</TabsTrigger>
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
            </TabsList>

            {/* Informations générales */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales</CardTitle>
                  <CardDescription>Modifiez les informations de base de l'intervention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="interventionId">ID de l'intervention</Label>
                      <Input id="interventionId" value={interventionId} disabled className="bg-gray-100" />
                      <p className="text-xs text-muted-foreground">L'ID de l'intervention ne peut pas être modifié</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">
                        Titre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="title"
                        placeholder="Titre de l'intervention"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site">
                        Site <span className="text-red-500">*</span>
                      </Label>
                      <Select value={siteId} onValueChange={setSiteId} required>
                        <SelectTrigger id="site">
                          <SelectValue placeholder="Sélectionner un site" />
                        </SelectTrigger>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.id} value={site.id}>
                              {site.id} - {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">
                        Type d'intervention <span className="text-red-500">*</span>
                      </Label>
                      <Select value={type} onValueChange={setType} required>
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="maintenance">Maintenance préventive</SelectItem>
                          <SelectItem value="repair">Réparation</SelectItem>
                          <SelectItem value="upgrade">Mise à niveau</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">
                        Priorité <span className="text-red-500">*</span>
                      </Label>
                      <Select value={priority} onValueChange={setPriority} required>
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
                      <Label htmlFor="status">
                        Statut <span className="text-red-500">*</span>
                      </Label>
                      <Select value={status} onValueChange={setStatus} required>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Brouillon</SelectItem>
                          <SelectItem value="scheduled">Planifiée</SelectItem>
                          <SelectItem value="in_progress">En cours</SelectItem>
                          <SelectItem value="completed">Terminée</SelectItem>
                          <SelectItem value="cancelled">Annulée</SelectItem>
                          <SelectItem value="archived">Archivée</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Description détaillée de l'intervention..."
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Planification */}
            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>Planification</CardTitle>
                  <CardDescription>Modifiez la date et l'heure de l'intervention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">
                        Date prévue <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">
                        Heure prévue <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="scheduledTime"
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedDuration">Durée estimée (heures)</Label>
                      <Input
                        id="estimatedDuration"
                        type="number"
                        min="0.5"
                        step="0.5"
                        placeholder="Ex: 2.5"
                        value={estimatedDuration}
                        onChange={(e) => setEstimatedDuration(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ressources */}
            <TabsContent value="resources">
              <Card>
                <CardHeader>
                  <CardTitle>Ressources</CardTitle>
                  <CardDescription>Modifiez les techniciens et équipements nécessaires</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Technicien assigné</h3>
                    <div className="space-y-2">
                      <Select value={assignedTechnician} onValueChange={handleTechnicianChange}>
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
                      {!assignedTechnician && (
                        <p className="text-sm text-red-500">Veuillez assigner un technicien</p>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Équipements requis</h3>
                    <div className="space-y-4">
                      {requiredEquipment.map((eq, index) => (
                        <div key={eq.id} className="flex items-center space-x-2">
                          <div className="flex-1 flex items-center space-x-2">
                            <span className="font-medium">{index + 1}.</span>
                            <span>{eq.name}</span>
                            <span className="text-sm text-muted-foreground">Quantité: {eq.quantity}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEquipment(eq.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            Supprimer
                          </Button>
                        </div>
                      ))}

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Nom de l'équipement"
                            value={newEquipmentName}
                            onChange={(e) => setNewEquipmentName(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            min="1"
                            placeholder="Qté"
                            value={newEquipmentQuantity}
                            onChange={(e) => setNewEquipmentQuantity(e.target.value)}
                            className="w-20"
                          />
                          <Button type="button" onClick={addEquipment}>
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tâches */}
            <TabsContent value="tasks">
              <Card>
                <CardHeader>
                  <CardTitle>Tâches</CardTitle>
                  <CardDescription>Modifiez les tâches à effectuer lors de l'intervention</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {tasks.map((task, index) => (
                      <div key={task.id} className="flex items-center space-x-2">
                        <div className="flex-1 flex items-center space-x-2">
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskStatusUpdate(task.id, Boolean(checked))}
                          />
                          <Label
                            htmlFor={`task-${task.id}`}
                            className={`cursor-pointer ${task.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            <span className="font-medium mr-2">{index + 1}.</span>
                            {task.description}
                          </Label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(task.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Supprimer
                        </Button>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="md:col-span-3">
                        <Input
                          placeholder="Description de la tâche"
                          value={newTaskDescription}
                          onChange={(e) => setNewTaskDescription(e.target.value)}
                        />
                      </div>
                      <Button type="button" onClick={addTask}>
                        Ajouter une tâche
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-6">
            <Button variant="outline" type="button" onClick={() => router.push("/manager/interventions")}>
              Annuler
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isSubmitting}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer les modifications
            </Button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  )
}
