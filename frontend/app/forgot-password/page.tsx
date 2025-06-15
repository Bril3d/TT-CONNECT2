"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import TelecomIllustration from "@/components/telecom-illustration"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Send forgot password request
      await axios.post(`${API_URL}/auth/forgot-password`, { email })

      setIsSubmitted(true)
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour les instructions de réinitialisation.",
      })
    } catch (error: any) {
      console.error("Forgot password error:", error)
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Side - Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img
                src="/placeholder.svg?height=80&width=160"
                alt="Tunisie Telecom Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Mot de passe oublié</h2>
            <p className="mt-2 text-gray-600">
              {isSubmitted
                ? "Vérifiez votre email pour les instructions"
                : "Entrez votre email pour réinitialiser votre mot de passe"}
            </p>
          </div>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Entrez votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Email envoyé !</h3>
                <p className="text-gray-600">
                  Un email avec les instructions de réinitialisation a été envoyé à{" "}
                  <span className="font-medium text-blue-600">{email}</span>
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  Si vous ne recevez pas l'email dans quelques minutes, vérifiez votre dossier spam.
                </p>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la connexion
            </Link>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-500">
            <p>Besoin d'aide ? Contactez le support technique de Tunisie Telecom</p>
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
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Main Title */}
            <h1 className="text-4xl font-bold leading-tight">
              Récupération
              <span className="block text-white">de compte</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-white/80 leading-relaxed">
              Nous vous aiderons à récupérer l'accès à votre compte GSM Management en toute sécurité
            </p>

            {/* Steps */}
            <div className="space-y-4 text-left mt-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="text-white/90">Entrez votre adresse email</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="text-white/90">Vérifiez votre boîte de réception</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <span className="text-white/90">Suivez les instructions reçues</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <span className="text-white/90">Créez un nouveau mot de passe</span>
              </div>
            </div>

            {/* Security Note */}
            <div className="bg-white/10 rounded-lg p-4 mt-8">
              <p className="text-white/90 text-sm">
                <strong>Sécurité :</strong> Le lien de réinitialisation expirera dans 24 heures pour votre protection.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  )
}
