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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle, Calendar, FileText, MapPin, Radio, PenToolIcon as Tool, Loader2 } from "lucide-react"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export function SitesList() {
  const [sites, setSites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSite, setSelectedSite] = useState<any>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isEquipmentDialogOpen, setIsEquipmentDialogOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      setIsLoading(true)
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
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewSiteDetails = (site: any) => {
    setSelectedSite(site)
    setIsDetailsDialogOpen(true)
  }

  const handleViewEquipment = (site: any) => {
    setSelectedSite(site)
    setIsEquipmentDialogOpen(true)
  }

  const handleCreateTicket = (site: any) => {
    // Store site info in localStorage to pre-fill the ticket form
    localStorage.setItem(
      "ticketSite",
      JSON.stringify({
        id: site.id,
        name: site.name,
      }),
    )

    // Navigate to tickets page
    window.location.href = "/technician/tickets"

    toast({
      title: "Création de ticket",
      description: `Redirection vers la page de création de ticket pour le site ${site.name}.`,
    })
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "maintenance":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "inactive":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "maintenance":
        return "Maintenance"
      case "inactive":
        return "Inactif"
      default:
        return status
    }
  }

  const filteredSites = sites.filter((site) => {
    const matchesStatus = statusFilter === "all" || site.status === statusFilter
    const matchesType = typeFilter === "all" || site.type === typeFilter
    return matchesStatus && matchesType
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Chargement des sites...</span>
      </div>
    )
  }

  return (
    <>
      <Card className="border-gray-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-gray-900">Sites</CardTitle>
              <CardDescription className="text-gray-600">Liste des sites GSM</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] border-gray-300 focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="macro">Macro</SelectItem>
                  <SelectItem value="micro">Micro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSites.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Aucun site ne correspond à votre filtre</div>
            ) : (
              filteredSites.map((site) => (
                <div key={site.id} className="rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{site.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <MapPin className="h-4 w-4" />
                        <span>{site.address}</span>
                      </div>
                    </div>
                    <Badge className={getStatusBadgeClass(site.status)}>{getStatusLabel(site.status)}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">ID: {site.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tool className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Type: {site.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Dernière maintenance: {site.lastMaintenance || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Technologies:</span>
                      <div className="flex gap-1">
                        {site.technologies &&
                          site.technologies.map((tech: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                              {tech}
                            </Badge>
                          ))}
                        {(!site.technologies || site.technologies.length === 0) && (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">Capacité:</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: `${site.capacity || 0}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{site.capacity || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewSiteDetails(site)}
                      className="border-gray-300"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewEquipment(site)}
                      className="border-gray-300"
                    >
                      <Tool className="h-4 w-4 mr-2" />
                      Équipements
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleCreateTicket(site)}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Signaler incident
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Site Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-3xl border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Détails du site</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedSite?.id} - {selectedSite?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedSite && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Informations générales</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Type:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSite.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Statut:</span>
                      <Badge className={getStatusBadgeClass(selectedSite.status)}>
                        {getStatusLabel(selectedSite.status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Adresse:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSite.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Coordonnées:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSite.coordinates || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Dernière maintenance:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSite.lastMaintenance || "N/A"}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900">Technologies et performance</h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Technologies:</span>
                      <div className="flex gap-1">
                        {selectedSite.technologies &&
                          selectedSite.technologies.map((tech: string, index: number) => (
                            <Badge key={index} variant="outline" className="border-blue-200 text-blue-700">
                              {tech}
                            </Badge>
                          ))}
                        {(!selectedSite.technologies || selectedSite.technologies.length === 0) && (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Capacité:</span>
                      <span className="text-sm font-medium text-gray-900">{selectedSite.capacity || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${selectedSite.capacity || 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900">Équipements (Aperçu)</h3>
                {selectedSite.equipment && selectedSite.equipment.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedSite.equipment.slice(0, 3).map((equipment: any, index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium text-gray-900">
                            {equipment.type} - {equipment.model || "N/A"}
                          </span>
                          <p className="text-xs text-gray-500">{equipment.id}</p>
                        </div>
                        <Badge
                          className={
                            equipment.status === "operational"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : equipment.status === "maintenance"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {equipment.status === "operational"
                            ? "Opérationnel"
                            : equipment.status === "maintenance"
                              ? "Maintenance requise"
                              : "Défectueux"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-500">Aucun équipement enregistré</div>
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
                handleViewEquipment(selectedSite)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Voir équipements
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Equipment Dialog */}
      <Dialog open={isEquipmentDialogOpen} onOpenChange={setIsEquipmentDialogOpen}>
        <DialogContent className="max-w-3xl border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Équipements du site</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedSite?.id} - {selectedSite?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedSite && (
            <div className="space-y-4">
              {selectedSite.equipment && selectedSite.equipment.length > 0 ? (
                <div className="rounded-md border border-gray-200">
                  <div className="grid grid-cols-4 gap-4 p-4 font-medium border-b border-gray-200 bg-gray-50">
                    <div className="text-gray-900">ID</div>
                    <div className="text-gray-900">Type</div>
                    <div className="text-gray-900">Modèle</div>
                    <div className="text-gray-900">Statut</div>
                  </div>
                  {selectedSite.equipment.map((equipment: any, index: number) => (
                    <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 items-center">
                      <div className="font-medium text-gray-900">{equipment.id}</div>
                      <div className="text-gray-600">{equipment.type}</div>
                      <div className="text-gray-600">{equipment.model || "N/A"}</div>
                      <div>
                        <Badge
                          className={
                            equipment.status === "operational"
                              ? "bg-green-100 text-green-800 border-green-200"
                              : equipment.status === "maintenance"
                                ? "bg-amber-100 text-amber-800 border-amber-200"
                                : "bg-red-100 text-red-800 border-red-200"
                          }
                        >
                          {equipment.status === "operational"
                            ? "Opérationnel"
                            : equipment.status === "maintenance"
                              ? "Maintenance requise"
                              : "Défectueux"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">Aucun équipement enregistré pour ce site</div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSite.equipment && selectedSite.equipment.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 text-gray-900">Statistiques des équipements</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Équipements opérationnels</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedSite.equipment.filter((eq: any) => eq.status === "operational").length}/
                          {selectedSite.equipment.length}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              (selectedSite.equipment.filter((eq: any) => eq.status === "operational").length /
                                selectedSite.equipment.length) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium mb-2 text-gray-900">Actions</h3>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-gray-300"
                      onClick={() => {
                        setIsEquipmentDialogOpen(false)
                        handleCreateTicket(selectedSite)
                      }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Signaler un problème d'équipement
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEquipmentDialogOpen(false)} className="border-gray-300">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
