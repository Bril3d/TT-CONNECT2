"use client"

import { Smartphone, Wifi, Radio, Satellite, Signal } from "lucide-react"
import { useEffect, useState } from "react"

export default function TelecomIllustration() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {/* Floating icons with animation */}
        <div
          className="absolute top-20 left-16 animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        >
          <Smartphone className="w-12 h-12 text-white/60" />
        </div>
        <div
          className="absolute top-32 right-20 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        >
          <Wifi className="w-10 h-10 text-white/60" />
        </div>
        <div
          className="absolute bottom-32 left-20 animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        >
          <Radio className="w-14 h-14 text-white/60" />
        </div>
        <div
          className="absolute bottom-20 right-16 animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "4.5s" }}
        >
          <Satellite className="w-11 h-11 text-white/60" />
        </div>
        <div
          className="absolute top-1/2 left-1/4 animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "3.8s" }}
        >
          <Signal className="w-8 h-8 text-white/60" />
        </div>

        {/* Geometric shapes */}
        <div
          className="absolute top-16 right-1/3 w-24 h-24 bg-white/10 rounded-full animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-24 left-1/3 w-32 h-32 bg-white/10 rounded-full animate-pulse"
          style={{ animationDuration: "5s" }}
        ></div>
        <div
          className="absolute top-1/3 right-20 w-16 h-16 bg-white/10 transform rotate-45 animate-spin"
          style={{ animationDuration: "20s" }}
        ></div>

        {/* Network connection lines */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 600">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(255, 255, 255)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(255, 255, 255)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M50,100 Q200,50 350,150 T300,400 Q150,450 100,300"
            stroke="url(#lineGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M100,200 Q250,150 300,300 T200,500"
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            fill="none"
            className="animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </svg>
      </div>

      {/* Central illustration */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Main tower/antenna */}
          <div className="w-2 h-40 bg-gradient-to-t from-white/70 to-white/40 mx-auto rounded-full shadow-lg"></div>

          {/* Signal waves */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
            <div className="w-16 h-16 border-4 border-white/30 rounded-full animate-ping"></div>
            <div
              className="absolute inset-2 w-12 h-12 border-4 border-white/40 rounded-full animate-ping"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute inset-4 w-8 h-8 border-4 border-white/50 rounded-full animate-ping"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          {/* Base */}
          <div className="w-8 h-6 bg-gradient-to-b from-white/50 to-white/30 mx-auto rounded-b-lg shadow-lg"></div>
        </div>
      </div>

      {/* Floating data packets */}
      <div
        className="absolute top-1/4 left-1/4 w-3 h-3 bg-white/70 rounded-full animate-bounce"
        style={{ animationDelay: "0s", animationDuration: "2s" }}
      ></div>
      <div
        className="absolute top-1/3 right-1/4 w-2 h-2 bg-white/70 rounded-full animate-bounce"
        style={{ animationDelay: "0.7s", animationDuration: "2.5s" }}
      ></div>
      <div
        className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-white/70 rounded-full animate-bounce"
        style={{ animationDelay: "1.2s", animationDuration: "3s" }}
      ></div>
    </div>
  )
}
