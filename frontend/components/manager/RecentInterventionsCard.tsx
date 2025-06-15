"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import axios from "axios"
import { Loader2 } from "lucide-react"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

interface Intervention {
  id: string;
  title: string;
  siteId: string;
  siteName: string;
  status: string;
  scheduledDate: string;
  assignedTechnicians: string[];
  technicianNames?: string;
}

export function RecentInterventionsCard() {
  const [interventions, setInterventions] = useState<Intervention[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        // Get auth token from localStorage
        let token = null;
        if (typeof window !== 'undefined') {
          token = localStorage.getItem('authToken');
        }

        // Set up headers with authorization token
        const headers = {
          Authorization: token ? `Bearer ${token}` : ''
        };
        
        const response = await axios.get(`${API_URL}/interventions`, { headers });
        // Sort by date and take the 5 most recent
        const sortedInterventions = response.data
          .sort((a: Intervention, b: Intervention) => {
            return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime();
          })
          .slice(0, 5);
        
        // Format technician names
        const formattedInterventions = sortedInterventions.map((intervention: Intervention) => {
          return {
            ...intervention,
            technicianNames: intervention.assignedTechnicians && intervention.assignedTechnicians.length > 0 
              ? intervention.assignedTechnicians.join(", ") 
              : "Non assigné"
          };
        });
        
        setInterventions(formattedInterventions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching interventions:", error);
        setLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "in_progress":
        return "En cours"
      case "completed":
        return "Terminée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  // Format date to French locale
  const formatDate = (dateString: string) => {
    if (!dateString) return "Non planifiée";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interventions récentes</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : interventions.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            Aucune intervention trouvée
          </div>
        ) : (
          <div className="space-y-4">
            {interventions.map((intervention) => (
              <div
                key={intervention.id}
                className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <h3 className="font-medium">{intervention.title}</h3>
                  <p className="text-sm text-gray-500">{intervention.siteName}</p>
                  <div className="flex items-center mt-1">
                    <Badge className={getStatusBadgeClass(intervention.status)}>
                      {getStatusLabel(intervention.status)}
                    </Badge>
                    <span className="text-xs text-gray-500 ml-2">{formatDate(intervention.scheduledDate)}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">{intervention.technicianNames}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
