"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AlertCircle, Eye, EyeOff, CheckCircle, ArrowLeft, Shield } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

export default function ResetPassword({ params }: { params: { token: string } }) {
  const [password, setPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()
  const { token } = params

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setIsLoading(true)

    try {
      // Send reset password request
      await axios.post(`${API_URL}/auth/reset-password/${token}`, {
        password,
      })

      setIsSuccess(true)
      toast({
        title: "Mot de passe réinitialisé",
        description: "Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.",
      })

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error: any) {
      console.error("Reset password error:", error)

      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError("Une erreur s'est produite lors de la réinitialisation du mot de passe")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            <img
              src="/placeholder.svg?height=60&width=120"
              alt="Tunisie Telecom Logo"
              className="h-16 w-auto object-contain mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-900">Réinitialisation du mot de passe</h2>
            <p className="text-gray-600 mt-2">Créez un nouveau mot de passe sécurisé pour votre compte</p>
          </div>

          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Mot de passe réinitialisé !</h3>
                <p className="text-gray-600">
                  Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">Redirection automatique dans quelques secondes...</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Aller à la page de connexion maintenant
              </Link>
            </div>
          ) : (
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

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                    placeholder="Entrez votre nouveau mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                    placeholder="Confirmez votre nouveau mot de passe"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              <div className="space-y-2">
                <div className="text-xs text-gray-600">Exigences du mot de passe :</div>
                <div className="space-y-1">
                  <div
                    className={`flex items-center text-xs ${password.length >= 6 ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${password.length >= 6 ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    Au moins 6 caractères
                  </div>
                  <div
                    className={`flex items-center text-xs ${password === confirmPassword && password.length > 0 ? "text-green-600" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${password === confirmPassword && password.length > 0 ? "bg-green-500" : "bg-gray-300"}`}
                    ></div>
                    Les mots de passe correspondent
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || password !== confirmPassword || password.length < 6}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? "Réinitialisation en cours..." : "Réinitialiser le mot de passe"}
                </button>
              </div>

              {/* Back to Login */}
              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center text-blue-600 hover:text-blue-500 transition-colors text-sm font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la page de connexion
                </Link>
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Pour votre sécurité, ce lien de réinitialisation expirera dans 24 heures.
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
