"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { CalendarIcon, Download, FileText, BarChart, PieChart, LineChart } from "lucide-react"
import { PerformanceChart } from "@/components/manager/PerformanceChart"
import { SiteDistributionChart } from "@/components/manager/SiteDistributionChart"
import { InterventionTrendsChart } from "@/components/manager/InterventionTrendsChart"

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("performance")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [period, setPeriod] = useState("month")
  const [reportType, setReportType] = useState("all")

  const handleExportReport = () => {
    // Implement export functionality
    console.log("Exporting report:", { type: activeTab, period, date, reportType })
    alert("Le rapport a été exporté avec succès.")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Rapports</h1>
          <p className="text-gray-600">Consultez et exportez des rapports pour le suivi et la prise de décision</p>
        </div>
        <Button onClick={handleExportReport} className="bg-orange-600 hover:bg-orange-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Exporter le rapport
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {period === "custom" && (
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de rapport" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rapports</SelectItem>
              <SelectItem value="sites">Sites</SelectItem>
              <SelectItem value="interventions">Interventions</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
              <SelectItem value="audits">Audits</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-1 md:grid-cols-4 h-auto">
          <TabsTrigger value="performance" className="flex items-center gap-2 py-3">
            <BarChart className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="sites" className="flex items-center gap-2 py-3">
            <PieChart className="h-4 w-4" />
            Distribution des sites
          </TabsTrigger>
          <TabsTrigger value="interventions" className="flex items-center gap-2 py-3">
            <LineChart className="h-4 w-4" />
            Tendances des interventions
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2 py-3">
            <FileText className="h-4 w-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance des sites</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <PerformanceChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribution des sites par type</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <SiteDistributionChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interventions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendances des interventions</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <InterventionTrendsChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Documents et rapports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: "Rapport d'audit Q1 2025", date: "01/04/2025", type: "PDF" },
                    { title: "KPIs mensuels - Avril 2025", date: "01/05/2025", type: "Excel" },
                    { title: "Rapport de maintenance préventive", date: "15/04/2025", type: "PDF" },
                    { title: "Analyse de performance réseau", date: "10/04/2025", type: "PDF" },
                    { title: "Statistiques d'interventions", date: "05/05/2025", type: "Excel" },
                    { title: "Rapport d'incidents critiques", date: "20/04/2025", type: "Word" },
                  ].map((doc, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{doc.title}</h3>
                          <p className="text-sm text-gray-500">Date: {doc.date}</p>
                        </div>
                        <Badge type={doc.type} />
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Badge({ type }: { type: string }) {
  const getColor = () => {
    switch (type) {
      case "PDF":
        return "bg-red-100 text-red-800"
      case "Excel":
        return "bg-green-100 text-green-800"
      case "Word":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColor()}`}>
      {type}
    </span>
  )
}
