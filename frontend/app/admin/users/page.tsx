"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditUserModal, type User } from "./edit-user-modal"
import Link from "next/link"
import { Lock, Unlock, Filter, Plus, Pencil, UserX } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRole, setSelectedRole] = useState<string>("Tous les rôles")
  const [selectedStatus, setSelectedStatus] = useState<string>("Tous les statuts")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/users`);
        // Transform the data to match our User interface
        const formattedUsers = response.data.map((user: any) => ({
          id: user._id,
          nom: user.nom,
          email: user.email,
          role: user.role,
          site: user.site,
          status: user.status,
          lastLogin: user.lastLogin
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des utilisateurs.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Function to handle editing a user
  const handleEditUser = (user: User) => {
    setSelectedUser({ ...user })
    setEditModalOpen(true)
  }

  // Function to handle user status change (lock/unlock)
  const handleStatusChange = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "verrouillé" ? "actif" : "verrouillé";
      await axios.patch(`${API_URL}/users/${userId}/status`, { status: newStatus });
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast({
        title: "Statut mis à jour",
        description: `L'utilisateur a été ${newStatus === "verrouillé" ? "verrouillé" : "déverrouillé"} avec succès.`,
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  // Function to handle user deletion
  const handleDeleteUser = async (userId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) {
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          toast({
            title: "Erreur d'authentification",
            description: "Vous devez être connecté pour effectuer cette action.",
            variant: "destructive",
          });
          return;
        }
        
        // Include token in request headers
        await axios.delete(`${API_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Remove the user from the local state
        setUsers(users.filter(user => user.id !== userId));
        
        toast({
          title: "Utilisateur supprimé",
          description: "L'utilisateur a été supprimé avec succès.",
        });
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'utilisateur.",
          variant: "destructive",
        });
      }
    }
  };

  // Function to refresh the user list after an update
  const handleUserUpdated = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`);
      const formattedUsers = response.data.map((user: any) => ({
        id: user._id,
        nom: user.nom,
        email: user.email,
        role: user.role,
        site: user.site,
        status: user.status,
        lastLogin: user.lastLogin
      }));
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error refreshing users:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter users based on search query, role, and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = selectedRole === "Tous les rôles" || user.role === selectedRole
    const matchesStatus = selectedStatus === "Tous les statuts" || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  })

  // Format date for last login
  const formatLastLogin = (date: string | Date | undefined) => {
    if (!date) return "-";
    
    const lastLogin = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `Il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
          <p className="text-muted-foreground">Gérez les techniciens et les managers</p>
        </div>
        <Link href="/admin/users/add">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un utilisateur
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Input
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les rôles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous les rôles">Tous les rôles</SelectItem>
              <SelectItem value="Technicien">Technicien</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous les statuts">Tous les statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="inactif">Inactif</SelectItem>
              <SelectItem value="verrouillé">Verrouillé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">NOM</th>
                  <th className="text-left py-3 px-4 font-medium">EMAIL</th>
                  <th className="text-left py-3 px-4 font-medium">RÔLE</th>
                  <th className="text-left py-3 px-4 font-medium">SITE</th>
                  <th className="text-left py-3 px-4 font-medium">STATUT</th>
                  <th className="text-left py-3 px-4 font-medium">DERNIÈRE CONNEXION</th>
                  <th className="text-left py-3 px-4 font-medium">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">Aucun utilisateur trouvé</td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.nom}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">{user.role}</td>
                      <td className="py-3 px-4">{user.site}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            user.status === "actif"
                              ? "bg-green-100 text-green-800"
                              : user.status === "inactif"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {formatLastLogin(user.lastLogin)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleEditUser(user)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleStatusChange(user.id, user.status)}
                          >
                            {user.status === "verrouillé" ? (
                              <>
                                <Unlock className="h-4 w-4" />
                                Déverrouiller
                              </>
                            ) : (
                              <>
                                <Lock className="h-4 w-4" />
                                Verrouiller
                              </>
                            )}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex items-center gap-1"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <UserX className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex justify-between items-center mt-4">
          <Button variant="outline" size="sm" disabled>
            Précédent
          </Button>
          <div className="text-sm text-gray-500">Page 1 sur 1</div>
          <Button variant="outline" size="sm" disabled>
            Suivant
          </Button>
        </div>
      </div>

      {/* Edit User Modal */}
      {editModalOpen && (
        <EditUserModal
          user={selectedUser}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onUserUpdated={handleUserUpdated}
        />
      )}
    </div>
  )
}

