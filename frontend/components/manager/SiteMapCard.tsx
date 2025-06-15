import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SiteMapCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Carte des sites</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
          <p className="text-gray-500">Carte interactive des sites GSM</p>
          {/* Intégrer ici une carte interactive avec les emplacements des sites */}
        </div>
      </CardContent>
    </Card>
  )
}
