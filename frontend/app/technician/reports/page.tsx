"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TechnicianLayout } from "@/components/technician/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download, Calendar } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ReportsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié
    const token = localStorage.getItem("adminToken")
    const userStr = localStorage.getItem("adminUser")

    if (!token || !userStr) {
      router.push("/login")
      return
    }

    try {
      const user = JSON.parse(userStr)
      // Vérifier si l'utilisateur est un technicien
      if (user.role !== "technician") {
        router.push("/login")
        return
      }

      setIsLoading(false)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    }
  }, [router])

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

  const handleDownloadReport = (type: string) => {
    toast({
      title: "Téléchargement du rapport",
      description: `Le rapport ${type} a été téléchargé avec succès.`,
    })
  }

  return (
    <TechnicianLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rapports</h2>
          <p className="text-muted-foreground">Consultez et téléchargez vos rapports d'activité</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapport d'interventions</CardTitle>
              <CardDescription>Résumé de vos interventions récentes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Dernière mise à jour: 25/05/2023</span>
                </div>
                <span className="text-sm font-medium">5 interventions</span>
              </div>
              <Button
                onClick={() => handleDownloadReport("interventions")}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rapport de tickets</CardTitle>
              <CardDescription>Résumé des tickets d'incidents créés</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Dernière mise à jour: 25/05/2023</span>
                </div>
                <span className="text-sm font-medium">3 tickets</span>
              </div>
              <Button
                onClick={() => handleDownloadReport("tickets")}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rapport d'activité</CardTitle>
              <CardDescription>Résumé complet de votre activité</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  <span className="text-sm">Dernière mise à jour: 25/05/2023</span>
                </div>
                <span className="text-sm font-medium">Mensuel</span>
              </div>
              <Button
                onClick={() => handleDownloadReport("activité")}
                className="w-full bg-orange-500 hover:bg-orange-600"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des rapports</CardTitle>
            <CardDescription>Accédez à vos rapports précédents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Rapport d'interventions - Avril 2023",
                  date: "01/05/2023",
                  type: "Interventions",
                },
                {
                  title: "Rapport de tickets - Avril 2023",
                  date: "01/05/2023",
                  type: "Tickets",
                },
                {
                  title: "Rapport d'activité - Avril 2023",
                  date: "01/05/2023",
                  type: "Activité",
                },
                {
                  title: "Rapport d'interventions - Mars 2023",
                  date: "01/04/2023",
                  type: "Interventions",
                },
                {
                  title: "Rapport de tickets - Mars 2023",
                  date: "01/04/2023",
                  type: "Tickets",
                },
              ].map((report, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{report.title}</p>
                      <p className="text-sm text-muted-foreground">Généré le: {report.date}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadReport(report.title)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TechnicianLayout>
  )
}
