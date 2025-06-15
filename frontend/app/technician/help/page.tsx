"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { TechnicianLayout } from "@/components/technician/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { HelpCircle, Search, MessageSquare, FileText, Send } from "lucide-react"

export default function HelpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    toast({
      title: "Recherche effectuée",
      description: `Recherche pour: "${searchQuery}"`,
    })
  }

  const handleSendMessage = () => {
    toast({
      title: "Message envoyé",
      description: "Votre message a été envoyé au support. Nous vous répondrons dans les plus brefs délais.",
    })
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
    <TechnicianLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Aide et Support</h2>
          <p className="text-muted-foreground">Obtenez de l'aide et consultez la documentation</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Centre d'aide</CardTitle>
              <CardDescription>Trouvez des réponses à vos questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans la documentation..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Guide des interventions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      Apprenez à gérer efficacement vos interventions sur le terrain.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Gestion des tickets</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      Comment créer et suivre des tickets d'incidents efficacement.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Maintenance des sites</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      Bonnes pratiques pour la maintenance des sites GSM.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Procédures d'urgence</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground mb-2">
                      Comment réagir en cas d'urgence sur un site GSM.
                    </p>
                    <Button variant="outline" size="sm" className="w-full">
                      <FileText className="h-4 w-4 mr-2" />
                      Consulter
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Questions fréquentes</h3>
                <div className="space-y-2">
                  {[
                    "Comment mettre à jour le statut d'une intervention ?",
                    "Comment signaler un problème urgent sur un site ?",
                    "Comment générer un rapport d'activité ?",
                    "Comment contacter un manager en cas d'urgence ?",
                    "Comment réinitialiser mon mot de passe ?",
                  ].map((question, index) => (
                    <div key={index} className="border-b pb-2 last:border-0 last:pb-0">
                      <button className="flex items-center justify-between w-full text-left">
                        <div className="flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">{question}</span>
                        </div>
                        <span className="text-xs text-orange-500">Voir réponse</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contacter le support</CardTitle>
              <CardDescription>Besoin d'aide ? Envoyez-nous un message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Sujet</Label>
                <Input id="subject" placeholder="Sujet de votre demande" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Décrivez votre problème..." rows={5} />
              </div>
              <Button onClick={handleSendMessage} className="w-full bg-orange-500 hover:bg-orange-600">
                <Send className="h-4 w-4 mr-2" />
                Envoyer
              </Button>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Autres moyens de contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Chat en direct (8h-18h)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Email: support@tunisietelecom.tn</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Téléphone: +216 XX XXX XXX</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TechnicianLayout>
  )
}

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium">
      {children}
    </label>
  )
}
