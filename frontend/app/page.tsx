import { redirect } from "next/navigation"


// Rediriger la page d'accueil vers la page de connexion
export default function HomePage() {
  redirect("/login")
}
