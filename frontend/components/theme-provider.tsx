"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

type ThemeContextType = {
  theme: string
  setTheme: (theme: string) => void
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: "light",
  setTheme: () => null,
})

export function useTheme() {
  const context = React.useContext(ThemeContext)
  const [theme, setThemeState] = React.useState<string>("light")

  const setTheme = React.useCallback((newTheme: string) => {
    setThemeState(newTheme)
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(newTheme)

      // Save to localStorage
      try {
        const savedSettings = localStorage.getItem("userSettings")
        const settings = savedSettings ? JSON.parse(savedSettings) : {}
        localStorage.setItem(
          "userSettings",
          JSON.stringify({
            ...settings,
            theme: newTheme,
          }),
        )
      } catch (error) {
        console.error("Error saving theme:", error)
      }
    }
  }, [])

  // Initialize from localStorage
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedSettings = localStorage.getItem("userSettings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          if (settings.theme) {
            setThemeState(settings.theme)
            document.documentElement.classList.remove("light", "dark")
            document.documentElement.classList.add(settings.theme)
          }

          // Apply primary color
          if (settings.primaryColor) {
            document.documentElement.style.setProperty("--primary-color", settings.primaryColor)
            document.documentElement.classList.remove(
              "theme-orange",
              "theme-blue",
              "theme-green",
              "theme-purple",
              "theme-red",
              "theme-gray",
            )
            document.documentElement.classList.add(`theme-${settings.primaryColor}`)
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error)
      }
    }
  }, [])

  if (!context || !context.setTheme) {
    return { theme, setTheme }
  }

  return context
}
