"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ManagerLayout } from "@/components/manager/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  MapPin,
  Edit,
  FileText,
  Archive,
  Trash2,
  AlertTriangle,
  Radio,
  Signal,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Define the Site type
interface Site {
  id: string;
  name: string;
  address: string;
  coordinates: string;
  category: string;
  type: string;
  status: string;
  technologies: string[];
  lastMaintenance: string;
  equipmentCount: number;
}

export default function SitesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [technologyFilter, setTechnologyFilter] = useState<string>("all")
  const [sites, setSites] = useState<Site[]>([])
  const [error, setError] = useState<string | null>(null)

  // Archive dialog
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [siteToArchive, setSiteToArchive] = useState<Site | null>(null)
  
  // Delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null)

  useEffect(() => {
    fetchSites()
  }, [])

  // Function to fetch sites from the API
  const fetchSites = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      const response = await axios.get(`${API_URL}/sites`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setSites(response.data)
    } catch (error) {
      console.error("Error fetching sites:", error)
      setError("Erreur lors du chargement des sites. Veuillez réessayer.")
      toast({
        title: "Erreur",
        description: "Impossible de charger les sites. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to filter sites
  const filterSites = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      // Build query parameters
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (categoryFilter !== "all") params.append("category", categoryFilter)
      if (technologyFilter !== "all") params.append("technology", technologyFilter)
      if (searchQuery) params.append("search", searchQuery)
      
      const response = await axios.get(`${API_URL}/sites/filter?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      setSites(response.data)
    } catch (error) {
      console.error("Error filtering sites:", error)
      toast({
        title: "Erreur",
        description: "Impossible de filtrer les sites. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Apply filters when any filter changes
  useEffect(() => {
    if (!isLoading) {
      filterSites()
    }
  }, [statusFilter, categoryFilter, technologyFilter])
  
  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoading) {
        filterSites()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-amber-100 text-amber-800"
      case "inactive":
        return "bg-red-100 text-red-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "maintenance":
        return "En maintenance"
      case "inactive":
        return "Inactif"
      case "archived":
        return "Archivé"
      default:
        return status
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "macro":
        return "Macro"
      case "micro":
        return "Micro"
      default:
        return category
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "outdoor":
        return "Outdoor"
      case "indoor":
        return "Indoor"
      default:
        return type
    }
  }

  // Handle archive site
  const openArchiveDialog = (site: Site) => {
    setSiteToArchive(site)
    setIsArchiveDialogOpen(true)
  }

  const handleArchiveSite = async () => {
    if (!siteToArchive) return
    
    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      await axios.patch(
        `${API_URL}/sites/${siteToArchive.id}/archive`, 
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )
      
      // Update local state
      setSites(sites.map(site => 
        site.id === siteToArchive.id ? { ...site, status: "archived" } : site
      ))
      
      setIsArchiveDialogOpen(false)
      
      toast({
        title: "Site archivé",
        description: `Le site ${siteToArchive.name} (${siteToArchive.id}) a été archivé avec succès.`,
      })
    } catch (error) {
      console.error("Error archiving site:", error)
      toast({
        title: "Erreur",
        description: "Impossible d'archiver le site. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }
  
  // Handle delete site
  const openDeleteDialog = (site: Site) => {
    setSiteToDelete(site)
    setIsDeleteDialogOpen(true)
  }
  
  const handleDeleteSite = async () => {
    if (!siteToDelete) return
    
    try {
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      await axios.delete(`${API_URL}/sites/${siteToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Remove from local state
      setSites(sites.filter(site => site.id !== siteToDelete.id))
      
      setIsDeleteDialogOpen(false)
      
      toast({
        title: "Site supprimé",
        description: `Le site ${siteToDelete.name} (${siteToDelete.id}) a été supprimé définitivement.`,
      })
    } catch (error) {
      console.error("Error deleting site:", error)
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le site. Veuillez réessayer.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement des sites...</p>
        </div>
      </div>
    )
  }

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sites GSM</h1>
            <p className="text-gray-600">Gérez les sites GSM et leurs équipements</p>
          </div>
          <Link href="/manager/sites/add">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un site
            </Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="Rechercher par ID, nom ou adresse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="maintenance">En maintenance</option>
                <option value="inactive">Inactif</option>
                <option value="archived">Archivé</option>
              </select>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">Toutes les catégories</option>
                <option value="macro">Macro</option>
                <option value="micro">Micro</option>
              </select>
              <select
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                value={technologyFilter}
                onChange={(e) => setTechnologyFilter(e.target.value)}
              >
                <option value="all">Toutes les technologies</option>
                <option value="2G">2G</option>
                <option value="3G">3G</option>
                <option value="4G">4G</option>
                <option value="5G">5G</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Technologies</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Équipements</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sites.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                        Aucun site trouvé
                      </TableCell>
                    </TableRow>
                  ) : (
                    sites.map((site) => (
                      <TableRow key={site.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{site.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{site.name}</span>
                            <span className="text-xs text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {site.address}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryLabel(site.category)}</TableCell>
                        <TableCell>{getTypeLabel(site.type)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {site.technologies.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(site.status)}>{getStatusLabel(site.status)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Signal className="h-4 w-4 text-orange-500 mr-1" />
                            <span>{site.equipmentCount}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/manager/sites/edit/${site.id}`)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <FileText className="h-4 w-4 mr-2" />
                                Voir détails
                              </DropdownMenuItem>
                              {site.status !== "archived" && (
                                <DropdownMenuItem onClick={() => openArchiveDialog(site)}>
                                  <Archive className="h-4 w-4 mr-2" />
                                  Archiver
                                </DropdownMenuItem>
                              )}
                              {site.status === "archived" && (
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => openDeleteDialog(site)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer définitivement
                                </DropdownMenuItem>
                              )}
                              
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Archive Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Archiver le site</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir archiver ce site ? Cette action ne supprimera pas le site, mais le marquera comme
              archivé.
            </DialogDescription>
          </DialogHeader>

          {siteToArchive && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="font-medium">Informations du site</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <p>
                  <span className="font-medium">ID:</span> {siteToArchive.id}
                </p>
                <p>
                  <span className="font-medium">Nom:</span> {siteToArchive.name}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span> {siteToArchive.address}
                </p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Un site archivé n'apparaîtra plus dans les listes principales mais restera accessible dans les archives.
                Les équipements associés seront également marqués comme archivés.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleArchiveSite}>
              <Archive className="h-4 w-4 mr-2" />
              Archiver le site
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement le site</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement ce site ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>

          {siteToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <p className="font-medium">Informations du site</p>
              </div>
              <div className="bg-red-50 p-3 rounded-md">
                <p>
                  <span className="font-medium">ID:</span> {siteToDelete.id}
                </p>
                <p>
                  <span className="font-medium">Nom:</span> {siteToDelete.name}
                </p>
                <p>
                  <span className="font-medium">Adresse:</span> {siteToDelete.address}
                </p>
              </div>
              <p className="mt-4 text-sm text-red-600">
                Cette action supprimera définitivement le site et toutes les données associées.
                Cette opération ne peut pas être annulée.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteSite}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ManagerLayout>
  )
}
