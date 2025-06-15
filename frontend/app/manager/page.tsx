"use client"

import { useState, useEffect } from "react"
import { DashboardCard } from "@/components/manager/DashboardCard"
import { RecentInterventionsCard } from "@/components/manager/RecentInterventionsCard"
import { PerformanceStatsCard } from "@/components/manager/PerformanceStatsCard"
import axios from "axios"

// API URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function ManagerDashboard() {
  const [stats, setStats] = useState({
    sitesCount: 0,
    interventionsTotal: 0,
    pendingInterventions: 0,
    reportsCount: 0,
    sitesChange: 0,
    interventionsChange: 0,
    pendingChange: 0,
    reportsChange: 0,
    loading: true
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
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

        // Fetch sites count
        const sitesResponse = await axios.get(`${API_URL}/sites`, { headers });
        const sites = sitesResponse.data;
        
        // Fetch interventions data
        const interventionsResponse = await axios.get(`${API_URL}/interventions`, { headers });
        const interventions = interventionsResponse.data;
        
        // Calculate stats
        const pendingInterventions = interventions.filter(
          (intervention: any) => intervention.status === 'pending'
        ).length;
        
        const completedInterventions = interventions.filter(
          (intervention: any) => intervention.status === 'completed'
        ).length;
        
        // For demo purposes, we'll use completed interventions as "reports"
        // In a real app, you might have a separate reports endpoint
        
        setStats({
          sitesCount: sites.length,
          interventionsTotal: interventions.length,
          pendingInterventions: pendingInterventions,
          reportsCount: completedInterventions,
          sitesChange: 3, // These could be calculated by comparing with previous period
          interventionsChange: 12,
          pendingChange: -2,
          reportsChange: 5,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600">Bienvenue, Nidhal. Voici un aperçu de vos activités.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Sites GSM" 
          value={stats.loading ? "..." : stats.sitesCount.toString()} 
          change={stats.sitesChange.toString()} 
          changeType={stats.sitesChange >= 0 ? "increase" : "decrease"} 
          icon="antenna" 
        />
        <DashboardCard 
          title="Interventions" 
          value={stats.loading ? "..." : stats.interventionsTotal.toString()} 
          change={stats.interventionsChange.toString()} 
          changeType={stats.interventionsChange >= 0 ? "increase" : "decrease"} 
          icon="tool" 
        />
        <DashboardCard 
          title="Interventions en attente" 
          value={stats.loading ? "..." : stats.pendingInterventions.toString()} 
          change={stats.pendingChange.toString()} 
          changeType={stats.pendingChange >= 0 ? "increase" : "decrease"} 
          icon="clock" 
        />
        <DashboardCard 
          title="Rapports" 
          value={stats.loading ? "..." : stats.reportsCount.toString()} 
          change={stats.reportsChange.toString()} 
          changeType={stats.reportsChange >= 0 ? "increase" : "decrease"} 
          icon="file-text" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInterventionsCard />
        <PerformanceStatsCard />
      </div>
    </div>
  )
}
