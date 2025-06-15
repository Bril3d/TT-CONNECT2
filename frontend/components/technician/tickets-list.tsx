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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Clock, FileText, MapPin, Plus, Loader2 } from "lucide-react"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function TicketsList() {
  const [tickets, setTickets] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [newTicket, setNewTicket] = useState({
    site: "",
    urgency: "medium",
    title: "",
    description: "",
  })
  const [newUpdate, setNewUpdate] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sites, setSites] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchTickets()
    fetchSites()
  }, [])

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return
      }

      const response = await axios.get(`${API_URL}/tickets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setTickets(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching tickets:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les tickets.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const fetchSites = async () => {
    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return
      }

      const response = await axios.get(`${API_URL}/sites`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setSites(response.data)
    } catch (error) {
      console.error("Error fetching sites:", error)
    }
  }

  const handleCreateTicket = async () => {
    // Validate form
    if (!newTicket.site || !newTicket.title || !newTicket.description) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return
      }

      const response = await axios.post(`${API_URL}/tickets`, newTicket, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Add the new ticket to the list
      setTickets([response.data, ...tickets])
      setIsCreateDialogOpen(false)

      // Reset form
      setNewTicket({
        site: "",
        urgency: "medium",
        title: "",
        description: "",
      })

      toast({
        title: "Ticket créé",
        description: `Le ticket ${response.data.id} a été créé avec succès. Une notification a été envoyée aux managers.`,
      })
    } catch (error) {
      console.error("Error creating ticket:", error)
      toast({
        title: "Erreur",
        description: "Impossible de créer le ticket.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateTicket = (ticket: any) => {
    setSelectedTicket(ticket)
    setNewStatus(ticket.status)
    setNewUpdate("")
    setIsUpdateDialogOpen(true)
  }

  const handleViewDetails = (ticket: any) => {
    setSelectedTicket(ticket)
    setIsDetailsDialogOpen(true)
  }

  const handleSaveUpdate = async () => {
    if (!selectedTicket) return

    // Validate update
    if (!newUpdate.trim() && newStatus === selectedTicket.status) {
      toast({
        title: "Aucune modification",
        description: "Veuillez ajouter une mise à jour ou changer le statut.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        return
      }

      const response = await axios.patch(
        `${API_URL}/tickets/${selectedTicket.id}/update`,
        {
          text: newUpdate.trim() || undefined,
          status: newStatus !== selectedTicket.status ? newStatus : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Update the ticket in the list
      const updatedTickets = tickets.map((ticket) => (ticket.id === selectedTicket.id ? response.data : ticket))

      setTickets(updatedTickets)
      setIsUpdateDialogOpen(false)

      const statusChanged = newStatus !== selectedTicket.status
      const updateMessage = statusChanged
        ? `Le ticket ${selectedTicket.id} a été mis à jour et son statut a été modifié. Une notification a été envoyée aux managers.`
        : `Le ticket ${selectedTicket.id} a été mis à jour. Une notification a été envoyée aux managers.`

      toast({
        title: "Ticket mis à jour",
        description: updateMessage,
      })
    } catch (error) {
      console.error("Error updating ticket:", error)
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le ticket.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getUrgencyBadgeClass = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "Élevée"
      case "medium":
        return "Moyenne"
      case "low":
        return "Faible"
      default:
        return urgency
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Ouvert"
      case "in_progress":
        return "En cours"
      case "resolved":
        return "Résolu"
      default:
        return status
    }
  }

  const filteredTickets = statusFilter === "all" ? tickets : tickets.filter((ticket) => ticket.status === statusFilter)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des tickets...</span>
      </div>
    )
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-900">Tickets d'Incidents</CardTitle>
              <CardDescription className="text-gray-600">Gérez les incidents sur les sites</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Nouveau ticket
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun ticket ne correspond à votre filtre</div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">{ticket.title}</h3>
                        <Badge className={getUrgencyBadgeClass(ticket.urgency)}>
                          {getUrgencyLabel(ticket.urgency)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {ticket.siteName} ({ticket.site})
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeClass(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">{ticket.description}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Créé le: {ticket.createdAt}</span>
                  </div>

                  {ticket.updates && ticket.updates.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2 text-gray-900">Dernière mise à jour:</h4>
                      <div className="text-sm text-gray-600">{ticket.updates.slice(-1)[0].text}</div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(ticket)}
                      className="border-gray-300"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleUpdateTicket(ticket)}
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

      {/* Create Ticket Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Créer un nouveau ticket d'incident</DialogTitle>
            <DialogDescription className="text-gray-600">Signalez un incident sur un site GSM</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="site" className="text-sm font-medium text-gray-700">
                Site concerné <span className="text-red-500">*</span>
              </label>
              <Select value={newTicket.site} onValueChange={(value) => setNewTicket({ ...newTicket, site: value })}>
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
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

            <div className="grid gap-2">
              <label htmlFor="urgency" className="text-sm font-medium text-gray-700">
                Niveau d'urgence
              </label>
              <Select
                value={newTicket.urgency}
                onValueChange={(value) => setNewTicket({ ...newTicket, urgency: value })}
              >
                <SelectTrigger className="border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Sélectionner un niveau d'urgence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Faible</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Élevée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium text-gray-700">
                Titre <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                placeholder="Titre court décrivant l'incident"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="description"
                placeholder="Description détaillée de l'incident..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                rows={4}
                className="border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-gray-300">
              Annuler
            </Button>
            <Button
              onClick={handleCreateTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>Créer le ticket</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Ticket Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent className="border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Mettre à jour le ticket</DialogTitle>
            <DialogDescription className="text-gray-600">
              Ticket {selectedTicket?.id} - {selectedTicket?.title}
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
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="update" className="text-sm font-medium text-gray-700">
                Mise à jour
              </label>
              <Textarea
                id="update"
                placeholder="Ajoutez des informations sur l'évolution de l'incident..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
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
            <DialogTitle className="text-gray-900">Détails du ticket</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedTicket?.id} - {selectedTicket?.title}
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Informations générales</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Site:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTicket.siteName} ({selectedTicket.site})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Emplacement:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTicket.location || "Non spécifié"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Créé le:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedTicket.createdAt}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Urgence:</span>
                      <Badge className={getUrgencyBadgeClass(selectedTicket.urgency)}>
                        {getUrgencyLabel(selectedTicket.urgency)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <Badge className={getStatusBadgeClass(selectedTicket.status)}>
                        {getStatusLabel(selectedTicket.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-sm text-gray-600">{selectedTicket.description}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Historique des mises à jour</h3>
                <div className="mt-2 border border-gray-200 rounded-md">
                  {selectedTicket.updates && selectedTicket.updates.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {selectedTicket.updates.map((update: any, index: number) => (
                        <div key={index} className="p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-gray-500">{update.date}</span>
                          </div>
                          <p className="text-sm text-gray-600">{update.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 text-sm text-gray-500">Aucune mise à jour pour le moment</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="border-gray-300">
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
