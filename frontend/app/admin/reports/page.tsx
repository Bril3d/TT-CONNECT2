"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar, Download, FileText, Filter, Printer } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("activity")

  // Données fictives pour les rapports d'activité
  const activityData = [
    {
      id: 1,
      user: "Ahmed Benali",
      action: "Connexion au système",
      date: "2023-05-10 08:32",
      ip: "192.168.1.45",
    },
    {
      id: 2,
      user: "Sophia Lahmadi",
      action: "Création d'une intervention",
      date: "2023-05-10 09:15",
      ip: "192.168.1.23",
    },
    {
      id: 3,
      user: "Karim Mansouri",
      action: "Modification d'un site",
      date: "2023-05-09 14:22",
      ip: "192.168.1.78",
    },
    {
      id: 4,
      user: "Leila Tazi",
      action: "Suppression d'un équipement",
      date: "2023-05-09 11:05",
      ip: "192.168.1.32",
    },
    {
      id: 5,
      user: "Omar Alaoui",
      action: "Exportation de données",
      date: "2023-05-08 16:47",
      ip: "192.168.1.56",
    },
  ]

  // Données fictives pour les rapports d'interventions
  const interventionsData = [
    {
      id: 1,
      site: "Site Casablanca Nord",
      type: "Maintenance préventive",
      technicien: "Ahmed Benali",
      date: "2023-05-15",
      statut: "Planifiée",
    },
    {
      id: 2,
      site: "Site Rabat Centre",
      type: "Réparation",
      technicien: "Karim Mansouri",
      date: "2023-05-12",
      statut: "Terminée",
    },
    {
      id: 3,
      site: "Site Marrakech Est",
      type: "Installation",
      technicien: "Sophia Lahmadi",
      date: "2023-05-11",
      statut: "En cours",
    },
    {
      id: 4,
      site: "Site Tanger Sud",
      type: "Inspection",
      technicien: "Omar Alaoui",
      date: "2023-05-10",
      statut: "Terminée",
    },
    {
      id: 5,
      site: "Site Agadir Centre",
      type: "Maintenance corrective",
      technicien: "Leila Tazi",
      date: "2023-05-08",
      statut: "Terminée",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Sélectionner la période
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filtres
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="activity" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="activity">Activité utilisateurs</TabsTrigger>
          <TabsTrigger value="interventions">Interventions</TabsTrigger>
          <TabsTrigger value="equipment">Équipements</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport d'activité utilisateurs</CardTitle>
              <CardDescription>
                Consultez l'historique des actions effectuées par les utilisateurs du système.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tous les utilisateurs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      <SelectItem value="ahmed">Ahmed Benali</SelectItem>
                      <SelectItem value="sophia">Sophia Lahmadi</SelectItem>
                      <SelectItem value="karim">Karim Mansouri</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Toutes les actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les actions</SelectItem>
                      <SelectItem value="login">Connexion</SelectItem>
                      <SelectItem value="create">Création</SelectItem>
                      <SelectItem value="modify">Modification</SelectItem>
                      <SelectItem value="delete">Suppression</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Date et heure</TableHead>
                    <TableHead>Adresse IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.user}</TableCell>
                      <TableCell>{item.action}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.ip}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="interventions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des interventions</CardTitle>
              <CardDescription>
                Consultez l'historique et les statistiques des interventions sur les sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tous les sites" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les sites</SelectItem>
                      <SelectItem value="casa">Casablanca Nord</SelectItem>
                      <SelectItem value="rabat">Rabat Centre</SelectItem>
                      <SelectItem value="marrakech">Marrakech Est</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tous les types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="preventive">Maintenance préventive</SelectItem>
                      <SelectItem value="corrective">Maintenance corrective</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Site</TableHead>
                    <TableHead>Type d'intervention</TableHead>
                    <TableHead>Technicien</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interventionsData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.site}</TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell>{item.technicien}</TableCell>
                      <TableCell>{item.date}</TableCell>
                      <TableCell>{item.statut}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des équipements</CardTitle>
              <CardDescription>
                Consultez l'état et les statistiques des équipements sur tous les sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center text-center">
                  <FileText className="h-10 w-10 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucune donnée disponible</h3>
                  <p className="text-sm text-gray-500">Les rapports d'équipements seront disponibles prochainement.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des sites</CardTitle>
              <CardDescription>Consultez les statistiques et l'état de tous les sites gérés.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-40">
                <div className="flex flex-col items-center text-center">
                  <FileText className="h-10 w-10 text-gray-400 mb-2" />
                  <h3 className="text-lg font-medium">Aucune donnée disponible</h3>
                  <p className="text-sm text-gray-500">Les rapports de sites seront disponibles prochainement.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
