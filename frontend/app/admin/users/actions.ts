"use server"

import { revalidatePath } from "next/cache";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// This is a server action to update user information
export async function updateUser(userId: string, userData: Record<string, any>) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Make API call to update user
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    
    // Revalidate the users page to show updated data
    revalidatePath("/admin/users");
    
    return response.data;
  } catch (error: any) {
    console.error(`Error updating user ${userId}:`, error.message);
    throw new Error(error.response?.data?.message || "Failed to update user");
  }
}

// Create a new user
export async function createUser(userData: Record<string, any>) {
  try {
    // Make API call to create user
    const response = await axios.post(`${API_URL}/users`, userData);
    
    // Revalidate the users page to show updated data
    revalidatePath("/admin/users");
    
    return response.data;
  } catch (error: any) {
    console.error("Error creating user:", error.message);
    throw new Error(error.response?.data?.message || "Failed to create user");
  }
}

// Delete a user
export async function deleteUser(userId: string) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    // Make API call to delete user
    const response = await axios.delete(`${API_URL}/users/${userId}`);
    
    // Revalidate the users page to show updated data
    revalidatePath("/admin/users");
    
    return response.data;
  } catch (error: any) {
    console.error(`Error deleting user ${userId}:`, error.message);
    throw new Error(error.response?.data?.message || "Failed to delete user");
  }
}
