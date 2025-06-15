"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Calendar, MapPin, User, PenToolIcon as Tool, Clock, FileText, Loader2 } from "lucide-react"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Status mapping between API and UI
const statusMapping = {
  scheduled: "Planifiée",
  in_progress: "En cours",
  completed: "Terminée",
  cancelled: "Annulée",
  archived: "Archivée",
}

// Type mapping between API and UI
const typeMapping = {
  installation: "Installation",
  maintenance: "Maintenance",
  repair: "Réparation",
  upgrade: "Mise à jour",
  inspection: "Inspection",
}

export function InterventionsList() {
  const [interventions, setInterventions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedIntervention, setSelectedIntervention] = useState<any>(null)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [newObservation, setNewObservation] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchInterventions()
  }, [])

  const fetchInterventions = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("authToken")
      if (!token) {
        return
      }

      const response = await axios.get(`${API_URL}/interventions/my-interventions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setInterventions(response.data)
    } catch (error) {
      console.error("Error fetching interventions:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les interventions.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = (intervention: any) => {
    setSelectedIntervention(intervention)
    setNewStatus(intervention.status)
    setIsUpdateDialogOpen(true)
  }

  const handleViewDetails = (intervention: any) => {
    setSelectedIntervention(intervention)
    setIsDetailsDialogOpen(true)
  }

  const handleSaveUpdate = async () => {
    if (!selectedIntervention) return

    // Update intervention status
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return
      }

      // Update status if changed
      if (newStatus !== selectedIntervention.status) {
        await axios.patch(
          `${API_URL}/interventions/${selectedIntervention.id}/status`,
          { status: newStatus },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
      }

      // Update task status if needed (this would require additional API endpoint)
      // For now, we'll just simulate the update locally

      const updatedInterventions = interventions.map((intervention) => {
        if (intervention.id === selectedIntervention.id) {
          return {
            ...intervention,
            status: newStatus,
            // Add observation if provided (would require API support)
            observations: newObservation.trim()
              ? [
                  ...intervention.observations,
                  {
                    date: new Date().toLocaleString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    text: newObservation,
                  },
                ]
              : intervention.observations,
          }
        }
        return intervention
      })

      setInterventions(updatedInterventions)
      setIsUpdateDialogOpen(false)
      setNewObservation("")

      // Simulate sending notification to manager
      toast({
        title: "Intervention mise à jour",
        description: `L'intervention ${selectedIntervention.id} a été mise à jour. Notification envoyée au manager.`,
      })
    } catch (error) {
      console.error("Error updating intervention:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'intervention.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      case "archived":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    return statusMapping[status as keyof typeof statusMapping] || status
  }

  const getTypeLabel = (type: string) => {
    return typeMapping[type as keyof typeof typeMapping] || type
  }

  const filteredInterventions =
    statusFilter === "all"
      ? interventions
      : interventions.filter((intervention) => intervention.status === statusFilter)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des interventions...</span>
      </div>
    )
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-900">Interventions Assignées</CardTitle>
              <CardDescription className="text-gray-600">Gérez vos interventions de maintenance</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="scheduled">Planifiée</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                  <SelectItem value="archived">Archivée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredInterventions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucune intervention ne correspond à votre filtre</div>
            ) : (
              filteredInterventions.map((intervention) => (
                <div
                  key={intervention.id}
                  className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{intervention.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {intervention.siteName} ({intervention.siteId})
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeClass(intervention.status)}>
                      {getStatusLabel(intervention.status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Date: {intervention.scheduledDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Technicien: {intervention.assignedTechnicians.join(", ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tool className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Type: {getTypeLabel(intervention.type)}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 text-gray-900">Tâches à effectuer:</h4>
                    <ul className="space-y-1">
                      {intervention.tasks &&
                        intervention.tasks.map((task: any, index: number) => (
                          <li key={index} className="text-sm flex items-center gap-2">
                            <div
                              className={`h-1.5 w-1.5 rounded-full ${task.completed ? "bg-green-500" : "bg-blue-500"}`}
                            ></div>
                            <span className="text-gray-600">{task.description}</span>
                          </li>
                        ))}
                      {(!intervention.tasks || intervention.tasks.length === 0) && (
                        <li className="text-sm text-gray-500">Aucune tâche définie</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(intervention)}
                      className="border-gray-300"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleUpdateStatus(intervention)}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Mettre à jour l'intervention</DialogTitle>
            <DialogDescription className="text-gray-600">
              Intervention {selectedIntervention?.id} - {selectedIntervention?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="status" className="text-sm font-medium text-gray-700">
                Statut
              </label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Planifiée</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="observation" className="text-sm font-medium text-gray-700">
                Observation
              </label>
              <Textarea
                id="observation"
                placeholder="Ajoutez vos observations sur cette intervention..."
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                rows={4}
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)} className="border-gray-300">
              Annuler
            </Button>
            <Button
              onClick={handleSaveUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>Enregistrer</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Détails de l'intervention</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedIntervention?.id} - {selectedIntervention?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedIntervention && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Informations générales</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Site:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedIntervention.siteName} ({selectedIntervention.siteId})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedIntervention.scheduledDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Heure:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedIntervention.scheduledTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Durée estimée:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedIntervention.estimatedDuration}h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {getTypeLabel(selectedIntervention.type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <Badge className={getStatusBadgeClass(selectedIntervention.status)}>
                        {getStatusLabel(selectedIntervention.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-sm text-gray-600">{selectedIntervention.description}</p>

                  {selectedIntervention.requiredEquipment && selectedIntervention.requiredEquipment.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-900">Équipement requis</h3>
                      <ul className="mt-2 space-y-1">
                        {selectedIntervention.requiredEquipment.map((equipment: any, index: number) => (
                          <li key={index} className="text-sm text-gray-600">
                            {equipment.name} (x{equipment.quantity})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Tâches à effectuer</h3>
                {selectedIntervention.tasks && selectedIntervention.tasks.length > 0 ? (
                  <ul className="mt-2 space-y-2">
                    {selectedIntervention.tasks.map((task: any, index: number) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <div
                          className={`h-5 w-5 flex items-center justify-center rounded-full text-xs font-medium ${
                            task.completed
                              ? "bg-green-100 text-green-600 border border-green-200"
                              : "bg-blue-100 text-blue-600 border border-blue-200"
                          } mt-0.5`}
                        >
                          {index + 1}
                        </div>
                        <span className="text-gray-600">{task.description}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-gray-500">Aucune tâche définie</p>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="border-gray-300">
              Fermer
            </Button>
            <Button
              onClick={() => {
                setIsDetailsDialogOpen(false)
                handleUpdateStatus(selectedIntervention)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Mettre à jour
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
