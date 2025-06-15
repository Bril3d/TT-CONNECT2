// Utility functions for authentication

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === "undefined") {
    return false
  }

  const token = localStorage.getItem("adminToken")
  const user = localStorage.getItem("adminUser")

  if (!token || !user) {
    return false
  }

  try {
    // Validate user object
    JSON.parse(user)
    return true
  } catch (e) {
    // Invalid user object
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    return false
  }
}

// Get current user
export const getCurrentUser = () => {
  if (typeof window === "undefined") {
    return null
  }

  const user = localStorage.getItem("adminUser")

  if (!user) {
    return null
  }

  try {
    return JSON.parse(user)
  } catch (e) {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminUser")
    return null
  }
}

// Logout user
export const logout = () => {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("adminToken")
  localStorage.removeItem("adminUser")

  // Redirect to login page
  window.location.href = "/login"
}
