"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { UserPlus, UserCog, ArrowLeft, Save, Eye, EyeOff } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type FormErrors = {
  [key: string]: string
}

export default function AddUserPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("technicien")
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    site: "",
    department: "",
    permissions: {
      canViewReports: false,
      canEditSites: false,
      canManageUsers: false,
      canApproveInterventions: false,
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleCheckboxChange = (permissionName: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionName]: checked,
      },
    }))
  }

  const validateForm = () => {
    const newErrors: FormErrors = {}

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = "Le prénom est requis"
    if (!formData.lastName.trim()) newErrors.lastName = "Le nom est requis"

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis"
    } else if (formData.password.length < 6) {
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }

    // Role-specific validations
    if (activeTab === "technicien" && !formData.site) {
      newErrors.site = "Le site est requis pour un technicien"
    }

    if (activeTab === "manager" && !formData.department) {
      newErrors.department = "Le département est requis pour un manager"
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Map form data to API format
      const userData = {
        nom: `${formData.firstName} ${formData.lastName}`,
        username: formData.email.split("@")[0],
        email: formData.email,
        password: formData.password,
        role: activeTab === "technicien" ? "Technicien" : "Manager",
        site: activeTab === "technicien" ? mapSiteValue(formData.site) : "-",
        status: "actif"
      };

      // Send data to API
      await axios.post(`${API_URL}/users`, userData);

      toast({
        title: "Utilisateur créé avec succès",
        description: `${formData.firstName} ${formData.lastName} a été ajouté en tant que ${activeTab === "technicien" ? "Technicien" : "Manager"}.`,
        variant: "default",
      })

      // Redirect to users list after successful creation
      router.push("/admin/users")
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de l'utilisateur.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Map site value to display name
  const mapSiteValue = (siteValue: string): string => {
    const siteMap: {[key: string]: string} = {
      'site_tunis': 'Site A',
      'site_sousse': 'Site B',
      'site_sfax': 'Site C',
      'site_bizerte': 'Site D',
      'site_gabes': 'Site E'
    };
    
    return siteMap[siteValue] || siteValue;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter un nouvel utilisateur</h1>
          <p className="text-gray-600">Créez un compte pour un technicien ou un manager</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/admin/users")} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Retour à la liste
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de l'utilisateur</CardTitle>
          <CardDescription>Sélectionnez le type d'utilisateur et remplissez les informations requises</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="technicien" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                Technicien
              </TabsTrigger>
              <TabsTrigger value="manager" className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Manager
              </TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Informations personnelles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        Prénom <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? "border-red-500" : ""}
                        placeholder="Prénom"
                      />
                      {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Nom <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? "border-red-500" : ""}
                        placeholder="Nom"
                      />
                      {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "border-red-500" : ""}
                        placeholder="email@exemple.com"
                      />
                      {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+216 XX XXX XXX"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Informations de connexion</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="password">
                        Mot de passe <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={handleChange}
                          className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                          placeholder="Mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmer le mot de passe <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={errors.confirmPassword ? "border-red-500" : ""}
                        placeholder="Confirmer le mot de passe"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </div>

                {activeTab === "technicien" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Informations du technicien</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="site">
                          Site assigné <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.site} onValueChange={(value) => handleSelectChange("site", value)}>
                          <SelectTrigger className={errors.site ? "border-red-500" : ""}>
                            <SelectValue placeholder="Sélectionner un site" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="site_tunis">Site Tunis</SelectItem>
                            <SelectItem value="site_sousse">Site Sousse</SelectItem>
                            <SelectItem value="site_sfax">Site Sfax</SelectItem>
                            <SelectItem value="site_bizerte">Site Bizerte</SelectItem>
                            <SelectItem value="site_gabes">Site Gabès</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.site && <p className="text-red-500 text-sm">{errors.site}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "manager" && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Informations du manager</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="department">
                          Département <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleSelectChange("department", value)}
                        >
                          <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                            <SelectValue placeholder="Sélectionner un département" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operations">Opérations</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="planning">Planification</SelectItem>
                            <SelectItem value="quality">Qualité</SelectItem>
                            <SelectItem value="administration">Administration</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-medium mb-4">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canViewReports"
                        checked={formData.permissions.canViewReports}
                        onCheckedChange={(checked) => handleCheckboxChange("canViewReports", checked as boolean)}
                      />
                      <Label htmlFor="canViewReports" className="cursor-pointer">
                        Consulter les rapports
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canEditSites"
                        checked={formData.permissions.canEditSites}
                        onCheckedChange={(checked) => handleCheckboxChange("canEditSites", checked as boolean)}
                      />
                      <Label htmlFor="canEditSites" className="cursor-pointer">
                        Modifier les sites
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canManageUsers"
                        checked={formData.permissions.canManageUsers}
                        onCheckedChange={(checked) => handleCheckboxChange("canManageUsers", checked as boolean)}
                      />
                      <Label htmlFor="canManageUsers" className="cursor-pointer">
                        Gérer les utilisateurs
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="canApproveInterventions"
                        checked={formData.permissions.canApproveInterventions}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("canApproveInterventions", checked as boolean)
                        }
                      />
                      <Label htmlFor="canApproveInterventions" className="cursor-pointer">
                        Approuver les interventions
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
                  Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Création en cours...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Créer l'utilisateur
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
