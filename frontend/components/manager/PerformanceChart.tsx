"use client"

import { Bar } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function PerformanceChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  }

  const labels = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin"]

  const data = {
    labels,
    datasets: [
      {
        label: "Disponibilité (%)",
        data: [99.5, 99.7, 99.6, 99.8, 99.9, 99.8],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Taux de résolution (%)",
        data: [92, 93, 91, 94, 95, 94],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
      {
        label: "Incidents critiques",
        data: [5, 4, 6, 3, 2, 3],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  }

  return <Bar options={options} data={data} />
}
