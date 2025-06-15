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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Plus, Save, Trash, Loader2 } from "lucide-react"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Interface for Site type
interface Site {
  _id: string;
  id: string;
  name: string;
  address: string;
  coordinates: string;
  description?: string;
  category: string;
  type: string;
  status: string;
  technologies: string[];
  equipmentCount: number;
  lastMaintenance?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function EditSitePage() {
  const router = useRouter()
  const params = useParams()
  const siteId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [site, setSite] = useState<Site | null>(null)

  // Site basic information
  const [siteName, setSiteName] = useState("")
  const [siteAddress, setSiteAddress] = useState("")
  const [siteCoordinates, setSiteCoordinates] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [siteCategory, setSiteCategory] = useState("macro")
  const [siteType, setSiteType] = useState("outdoor")
  const [siteStatus, setSiteStatus] = useState("active")

  // Site technologies
  const [technologies, setTechnologies] = useState({
    "2G": false,
    "3G": false,
    "4G": false,
    "5G": false,
  })

  // Site equipment
  const [antennas, setAntennas] = useState<any[]>([])
  const [transmissionEquipment, setTransmissionEquipment] = useState<any[]>([])
  const [radioEquipment, setRadioEquipment] = useState<any[]>([])

  useEffect(() => {
    const fetchSiteData = async () => {
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

        // Fetch site data with equipment from API
        const response = await axios.get(`${API_URL}/sites/${siteId}/equipment`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const siteData = response.data
        setSite(siteData)

        // Initialize form with site data
        setSiteName(siteData.name)
        setSiteAddress(siteData.address)
        setSiteCoordinates(siteData.coordinates)
        setSiteDescription(siteData.description || "")
        setSiteCategory(siteData.category)
        setSiteType(siteData.type)
        setSiteStatus(siteData.status)

        // Initialize technologies
        const techObj = {
          "2G": siteData.technologies.includes("2G"),
          "3G": siteData.technologies.includes("3G"),
          "4G": siteData.technologies.includes("4G"),
          "5G": siteData.technologies.includes("5G"),
        }
        setTechnologies(techObj)

        // Initialize equipment from fetched data
        if (siteData.equipment) {
          // Initialize antennas
          if (siteData.equipment.antennas && siteData.equipment.antennas.length > 0) {
            // Add client-side IDs for React rendering
            const antennasWithClientIds = siteData.equipment.antennas.map((antenna: any) => ({
              ...antenna,
              id: `antenna-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }))
            setAntennas(antennasWithClientIds)
          } else {
            // Default antenna if none exists
            setAntennas([{
              id: `antenna-${Date.now()}`,
              model: "",
              type: "sector",
              band: "",
              status: "operational"
            }])
          }
          
          // Initialize transmission equipment
          if (siteData.equipment.transmission && siteData.equipment.transmission.length > 0) {
            // Add client-side IDs for React rendering
            const transmissionWithClientIds = siteData.equipment.transmission.map((equip: any) => ({
              ...equip,
              id: `transmission-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }))
            setTransmissionEquipment(transmissionWithClientIds)
          } else {
            // Default transmission equipment if none exists
            setTransmissionEquipment([{
              id: `transmission-${Date.now()}`,
              model: "",
              type: "microwave",
              capacity: "",
              status: "operational"
            }])
          }
          
          // Initialize radio equipment
          if (siteData.equipment.radio && siteData.equipment.radio.length > 0) {
            // Add client-side IDs for React rendering
            const radioWithClientIds = siteData.equipment.radio.map((equip: any) => ({
              ...equip,
              id: `radio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }))
            setRadioEquipment(radioWithClientIds)
          } else {
            // Default radio equipment if none exists
            setRadioEquipment([{
              id: `radio-${Date.now()}`,
              model: "",
              type: "bbu",
              technology: "",
              status: "operational"
            }])
          }
        } else {
          // Initialize with default equipment if no equipment data
          setAntennas([{
            id: `antenna-${Date.now()}`,
            model: "",
            type: "sector",
            band: "",
            status: "operational"
          }])
          
          setTransmissionEquipment([{
            id: `transmission-${Date.now()}`,
            model: "",
            type: "microwave",
            capacity: "",
            status: "operational"
          }])
          
          setRadioEquipment([{
            id: `radio-${Date.now()}`,
            model: "",
            type: "bbu",
            technology: "",
            status: "operational"
          }])
        }

        setIsLoading(false)
      } catch (error: any) {
        console.error("Error fetching site data:", error)
        const errorMessage = error.response?.data?.message || "Erreur lors du chargement des données du site."
        
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive",
        })
        
        // Redirect back to sites list after error
        setTimeout(() => {
          router.push("/manager/sites")
        }, 1500)
      }
    }

    fetchSiteData()
  }, [router, siteId])

  // Handle antenna equipment
  const addAntenna = () => {
    setAntennas([
      ...antennas,
      {
        id: `antenna-${Date.now()}`,
        model: "",
        type: "",
        band: "",
        status: "operational",
      },
    ])
  }

  const removeAntenna = (id: string) => {
    if (antennas.length > 1) {
      setAntennas(antennas.filter((antenna) => antenna.id !== id))
    } else {
      toast({
        title: "Action impossible",
        description: "Vous devez avoir au moins une antenne.",
        variant: "destructive",
      })
    }
  }

  const updateAntenna = (id: string, field: string, value: string) => {
    setAntennas(antennas.map((antenna) => (antenna.id === id ? { ...antenna, [field]: value } : antenna)))
  }

  // Handle transmission equipment
  const addTransmissionEquipment = () => {
    setTransmissionEquipment([
      ...transmissionEquipment,
      {
        id: `transmission-${Date.now()}`,
        model: "",
        type: "",
        capacity: "",
        status: "operational",
      },
    ])
  }

  const removeTransmissionEquipment = (id: string) => {
    if (transmissionEquipment.length > 1) {
      setTransmissionEquipment(transmissionEquipment.filter((equipment) => equipment.id !== id))
    } else {
      toast({
        title: "Action impossible",
        description: "Vous devez avoir au moins un équipement de transmission.",
        variant: "destructive",
      })
    }
  }

  const updateTransmissionEquipment = (id: string, field: string, value: string) => {
    setTransmissionEquipment(
      transmissionEquipment.map((equipment) => (equipment.id === id ? { ...equipment, [field]: value } : equipment)),
    )
  }

  // Handle radio equipment
  const addRadioEquipment = () => {
    setRadioEquipment([
      ...radioEquipment,
      {
        id: `radio-${Date.now()}`,
        model: "",
        type: "",
        technology: "",
        status: "operational",
      },
    ])
  }

  const removeRadioEquipment = (id: string) => {
    if (radioEquipment.length > 1) {
      setRadioEquipment(radioEquipment.filter((equipment) => equipment.id !== id))
    } else {
      toast({
        title: "Action impossible",
        description: "Vous devez avoir au moins un équipement radio.",
        variant: "destructive",
      })
    }
  }

  const updateRadioEquipment = (id: string, field: string, value: string) => {
    setRadioEquipment(
      radioEquipment.map((equipment) => (equipment.id === id ? { ...equipment, [field]: value } : equipment)),
    )
  }

  // Handle technology toggles
  const toggleTechnology = (tech: string) => {
    setTechnologies({
      ...technologies,
      [tech]: !technologies[tech as keyof typeof technologies],
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validation
    if (!siteName || !siteAddress || !siteCoordinates) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Check if at least one technology is selected
    const hasTechnology = Object.values(technologies).some((value) => value)
    if (!hasTechnology) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez sélectionner au moins une technologie.",
        variant: "destructive",
      })
      setIsSubmitting(false)
      return
    }

    // Create updated site object with equipment data
    const updatedSite = {
      name: siteName,
      address: siteAddress,
      coordinates: siteCoordinates,
      description: siteDescription,
      category: siteCategory,
      type: siteType,
      status: siteStatus,
      technologies: Object.entries(technologies)
        .filter(([_, value]) => value)
        .map(([key, _]) => key),
      equipmentCount: antennas.length + transmissionEquipment.length + radioEquipment.length,
      lastMaintenance: new Date().toLocaleDateString('fr-FR'),
      // Add equipment data
      antennas: antennas.map(({ id, _id, site, createdAt, updatedAt, ...rest }) => rest), // Remove non-relevant fields
      transmission: transmissionEquipment.map(({ id, _id, site, createdAt, updatedAt, ...rest }) => rest),
      radio: radioEquipment.map(({ id, _id, site, createdAt, updatedAt, ...rest }) => rest)
    }

    try {
      // Get auth token
      const token = localStorage.getItem("authToken")
      
      if (!token) {
        router.push("/login")
        return
      }
      
      // Send data to backend API
      const response = await axios.put(`${API_URL}/sites/${siteId}`, updatedSite, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      // Show success message
      toast({
        title: "Site mis à jour avec succès",
        description: `Le site ${siteName} a été mis à jour.`,
      })
      
      // Redirect to sites list
      setTimeout(() => {
        router.push("/manager/sites")
      }, 1500)
    } catch (error: any) {
      console.error("Error updating site:", error)
      
      const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la mise à jour du site."
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
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
            <h2 className="text-2xl font-bold tracking-tight">Modifier le site {site?.id}</h2>
            <p className="text-muted-foreground">Modifiez les informations et équipements du site</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/manager/sites")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-4">
            <TabsList>
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="technologies">Technologies</TabsTrigger>
              <TabsTrigger value="antennas">Antennes</TabsTrigger>
              <TabsTrigger value="transmission">Transmission</TabsTrigger>
              <TabsTrigger value="radio">Équipement Radio</TabsTrigger>
            </TabsList>

            {/* Informations générales */}
            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>Informations générales du site</CardTitle>
                  <CardDescription>Modifiez les informations de base du site GSM</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteId">ID du site</Label>
                      <Input
                        id="siteId"
                        value={site?.id || ""}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-xs text-muted-foreground">L'ID du site ne peut pas être modifié</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteName">
                        Nom du site <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="siteName"
                        placeholder="Ex: Tunis Centre"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteAddress">
                        Adresse <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="siteAddress"
                        placeholder="Ex: Avenue Habib Bourguiba, Tunis"
                        value={siteAddress}
                        onChange={(e) => setSiteAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteCoordinates">
                        Coordonnées GPS <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="siteCoordinates"
                        placeholder="Ex: 36.8065, 10.1815"
                        value={siteCoordinates}
                        onChange={(e) => setSiteCoordinates(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="siteDescription">Description</Label>
                      <Textarea
                        id="siteDescription"
                        placeholder="Description du site..."
                        rows={3}
                        value={siteDescription}
                        onChange={(e) => setSiteDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteCategory">Catégorie du site</Label>
                      <Select value={siteCategory} onValueChange={setSiteCategory}>
                        <SelectTrigger id="siteCategory">
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="macro">Macro</SelectItem>
                          <SelectItem value="micro">Micro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteType">Type du site</Label>
                      <Select value={siteType} onValueChange={setSiteType}>
                        <SelectTrigger id="siteType">
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="outdoor">Outdoor</SelectItem>
                          <SelectItem value="indoor">Indoor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteStatus">Statut</Label>
                      <Select value={siteStatus} onValueChange={setSiteStatus}>
                        <SelectTrigger id="siteStatus">
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Actif</SelectItem>
                          <SelectItem value="maintenance">En maintenance</SelectItem>
                          <SelectItem value="inactive">Inactif</SelectItem>
                          <SelectItem value="archived">Archivé</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Technologies */}
            <TabsContent value="technologies">
              <Card>
                <CardHeader>
                  <CardTitle>Technologies du site</CardTitle>
                  <CardDescription>Modifiez les technologies disponibles sur ce site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="tech2g" className="flex items-center space-x-2 cursor-pointer">
                          <div className="space-y-1">
                            <p>Technologie 2G</p>
                            <p className="text-sm text-muted-foreground">GSM, GPRS, EDGE</p>
                          </div>
                        </Label>
                        <Switch
                          id="tech2g"
                          checked={technologies["2G"]}
                          onCheckedChange={() => toggleTechnology("2G")}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="tech3g" className="flex items-center space-x-2 cursor-pointer">
                          <div className="space-y-1">
                            <p>Technologie 3G</p>
                            <p className="text-sm text-muted-foreground">UMTS, HSPA, HSPA+</p>
                          </div>
                        </Label>
                        <Switch
                          id="tech3g"
                          checked={technologies["3G"]}
                          onCheckedChange={() => toggleTechnology("3G")}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="tech4g" className="flex items-center space-x-2 cursor-pointer">
                          <div className="space-y-1">
                            <p>Technologie 4G</p>
                            <p className="text-sm text-muted-foreground">LTE, LTE-Advanced</p>
                          </div>
                        </Label>
                        <Switch
                          id="tech4g"
                          checked={technologies["4G"]}
                          onCheckedChange={() => toggleTechnology("4G")}
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="tech5g" className="flex items-center space-x-2 cursor-pointer">
                          <div className="space-y-1">
                            <p>Technologie 5G</p>
                            <p className="text-sm text-muted-foreground">5G NR</p>
                          </div>
                        </Label>
                        <Switch
                          id="tech5g"
                          checked={technologies["5G"]}
                          onCheckedChange={() => toggleTechnology("5G")}
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-muted-foreground">
                        Note: Veuillez sélectionner au moins une technologie disponible sur ce site.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Antennes */}
            <TabsContent value="antennas">
              <Card>
                <CardHeader>
                  <CardTitle>Antennes</CardTitle>
                  <CardDescription>Modifiez les antennes installées sur ce site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {antennas.map((antenna, index) => (
                      <div key={antenna.id} className="space-y-4 p-4 border rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <Button variant="ghost" size="icon" onClick={() => removeAntenna(antenna.id)} type="button">
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <h3 className="font-medium">Antenne {index + 1}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`antenna-model-${antenna.id}`}>
                              Modèle <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`antenna-model-${antenna.id}`}
                              placeholder="Ex: Huawei ATR4518R6"
                              value={antenna.model}
                              onChange={(e) => updateAntenna(antenna.id, "model", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`antenna-type-${antenna.id}`}>
                              Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={antenna.type}
                              onValueChange={(value) => updateAntenna(antenna.id, "type", value)}
                            >
                              <SelectTrigger id={`antenna-type-${antenna.id}`}>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="directional">Directionnelle</SelectItem>
                                <SelectItem value="omnidirectional">Omnidirectionnelle</SelectItem>
                                <SelectItem value="panel">Panneau</SelectItem>
                                <SelectItem value="sector">Sectorielle</SelectItem>
                                <SelectItem value="mimo">MIMO</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`antenna-band-${antenna.id}`}>
                              Bande de fréquence <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`antenna-band-${antenna.id}`}
                              placeholder="Ex: 700MHz, 900MHz, 1800MHz"
                              value={antenna.band}
                              onChange={(e) => updateAntenna(antenna.id, "band", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`antenna-status-${antenna.id}`}>Statut</Label>
                            <Select
                              value={antenna.status}
                              onValueChange={(value) => updateAntenna(antenna.id, "status", value)}
                            >
                              <SelectTrigger id={`antenna-status-${antenna.id}`}>
                                <SelectValue placeholder="Sélectionner un statut" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operational">Opérationnel</SelectItem>
                                <SelectItem value="maintenance">En maintenance</SelectItem>
                                <SelectItem value="faulty">Défectueux</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addAntenna} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une antenne
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transmission */}
            <TabsContent value="transmission">
              <Card>
                <CardHeader>
                  <CardTitle>Équipement de transmission</CardTitle>
                  <CardDescription>Modifiez les équipements de transmission installés sur ce site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {transmissionEquipment.map((equipment, index) => (
                      <div key={equipment.id} className="space-y-4 p-4 border rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTransmissionEquipment(equipment.id)}
                            type="button"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <h3 className="font-medium">Équipement de transmission {index + 1}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`transmission-model-${equipment.id}`}>
                              Modèle <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`transmission-model-${equipment.id}`}
                              placeholder="Ex: Huawei OptiX RTN 950"
                              value={equipment.model}
                              onChange={(e) => updateTransmissionEquipment(equipment.id, "model", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`transmission-type-${equipment.id}`}>
                              Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={equipment.type}
                              onValueChange={(value) => updateTransmissionEquipment(equipment.id, "type", value)}
                            >
                              <SelectTrigger id={`transmission-type-${equipment.id}`}>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="microwave">Micro-onde</SelectItem>
                                <SelectItem value="fiber">Fibre optique</SelectItem>
                                <SelectItem value="satellite">Satellite</SelectItem>
                                <SelectItem value="ethernet">Ethernet</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`transmission-capacity-${equipment.id}`}>
                              Capacité <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`transmission-capacity-${equipment.id}`}
                              placeholder="Ex: 1Gbps, 10Gbps"
                              value={equipment.capacity}
                              onChange={(e) => updateTransmissionEquipment(equipment.id, "capacity", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`transmission-status-${equipment.id}`}>Statut</Label>
                            <Select
                              value={equipment.status}
                              onValueChange={(value) => updateTransmissionEquipment(equipment.id, "status", value)}
                            >
                              <SelectTrigger id={`transmission-status-${equipment.id}`}>
                                <SelectValue placeholder="Sélectionner un statut" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operational">Opérationnel</SelectItem>
                                <SelectItem value="maintenance">En maintenance</SelectItem>
                                <SelectItem value="faulty">Défectueux</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addTransmissionEquipment} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un équipement de transmission
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Radio Equipment */}
            <TabsContent value="radio">
              <Card>
                <CardHeader>
                  <CardTitle>Équipement radio</CardTitle>
                  <CardDescription>Modifiez les équipements radio installés sur ce site</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {radioEquipment.map((equipment, index) => (
                      <div key={equipment.id} className="space-y-4 p-4 border rounded-md relative">
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeRadioEquipment(equipment.id)}
                            type="button"
                          >
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>

                        <h3 className="font-medium">Équipement radio {index + 1}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`radio-model-${equipment.id}`}>
                              Modèle <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id={`radio-model-${equipment.id}`}
                              placeholder="Ex: Huawei BBU3900"
                              value={equipment.model}
                              onChange={(e) => updateRadioEquipment(equipment.id, "model", e.target.value)}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`radio-type-${equipment.id}`}>
                              Type <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={equipment.type}
                              onValueChange={(value) => updateRadioEquipment(equipment.id, "type", value)}
                            >
                              <SelectTrigger id={`radio-type-${equipment.id}`}>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bbu">BBU (Baseband Unit)</SelectItem>
                                <SelectItem value="rru">RRU (Remote Radio Unit)</SelectItem>
                                <SelectItem value="bts">BTS (Base Transceiver Station)</SelectItem>
                                <SelectItem value="nodeb">Node B</SelectItem>
                                <SelectItem value="enodeb">eNode B</SelectItem>
                                <SelectItem value="gnodeb">gNode B</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`radio-technology-${equipment.id}`}>
                              Technologie <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={equipment.technology}
                              onValueChange={(value) => updateRadioEquipment(equipment.id, "technology", value)}
                            >
                              <SelectTrigger id={`radio-technology-${equipment.id}`}>
                                <SelectValue placeholder="Sélectionner une technologie" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="2G">2G</SelectItem>
                                <SelectItem value="3G">3G</SelectItem>
                                <SelectItem value="4G">4G</SelectItem>
                                <SelectItem value="5G">5G</SelectItem>
                                <SelectItem value="multi">Multi-technologie</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`radio-status-${equipment.id}`}>Statut</Label>
                            <Select
                              value={equipment.status}
                              onValueChange={(value) => updateRadioEquipment(equipment.id, "status", value)}
                            >
                              <SelectTrigger id={`radio-status-${equipment.id}`}>
                                <SelectValue placeholder="Sélectionner un statut" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="operational">Opérationnel</SelectItem>
                                <SelectItem value="maintenance">En maintenance</SelectItem>
                                <SelectItem value="faulty">Défectueux</SelectItem>
                                <SelectItem value="inactive">Inactif</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button type="button" variant="outline" onClick={addRadioEquipment} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un équipement radio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour en cours...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ManagerLayout>
  )
}
