"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff, Wifi, CheckCircle } from "lucide-react"
import TelecomIllustration from "@/components/telecom-illustration"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function Login() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Authenticate with the backend API - VOTRE LOGIQUE ORIGINALE
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { token, user } = response.data

      // Store auth data in localStorage - VOTRE LOGIQUE ORIGINALE
      localStorage.setItem("authToken", token)
      localStorage.setItem("userData", JSON.stringify(user))

      toast({
        title: "Connexion réussie",
        description: `Bienvenue, ${user.nom}!`,
      })

      // Redirect based on user role - VOTRE LOGIQUE ORIGINALE
      if (user.role === "Admin") {
        router.push("/admin")
      } else if (user.role === "Manager") {
        router.push("/manager")
      } else if (user.role === "Technicien") {
        router.push("/technician/interventions")
      } else {
        // Fallback
        router.push("/admin")
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // VOTRE LOGIQUE ORIGINALE DE GESTION D'ERREURS
      if (error.response?.status === 401) {
        setError("Identifiants invalides. Veuillez réessayer.")
      } else {
        setError("Une erreur s'est produite lors de la connexion.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/ttlogo.png?height=80&width=160"
                alt="Tunisie Telecom Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">GSM Management</h2>
            <p className="mt-2 text-gray-600">Connectez-vous à votre compte</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r flex items-center"
                role="alert"
              >
                <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 transition-colors">
                  Mot de passe oublié?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                  placeholder="Entrez votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? "Connexion en cours..." : "Se connecter"}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            <p>Utilisez l'email et le mot de passe de votre compte pour vous connecter</p>
          </div>
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800">
          <TelecomIllustration />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white h-full">
          <div className="max-w-md text-center space-y-6">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Wifi className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl font-bold leading-tight">
              Bienvenue sur
              <span className="block text-white">GSM Management</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/80 leading-relaxed">
              La plateforme de gestion des infrastructures de télécommunications de Tunisie Telecom
            </p>

            {/* Features */}
            <div className="space-y-4 text-left mt-8">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white/90">Surveillance en temps réel</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white/90">Gestion des interventions</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white/90">Gestion des Sites GSM</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-white" />
                <span className="text-white/90">Interface intuitive</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
