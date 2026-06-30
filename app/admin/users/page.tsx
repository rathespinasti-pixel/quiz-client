"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

interface AdminUser {
  id: number
  username: string
  email: string
  role: string
  is_active: boolean
}

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") router.push("/dashboard")
  }, [user, authLoading, router])

  const load = () => api.get("/admin/users").then((r) => setUsers(r.data)).catch(() => {})

  useEffect(() => {
    if (user?.role === "admin") load()
  }, [user])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user?")) return
    await api.delete(`/admin/users/${id}`)
    load()
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {u.username}{" "}
                    <span className="text-xs text-muted-foreground">({u.role})</span>
                  </p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                </div>
                {u.role !== "admin" && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(u.id)}>
                    <Trash2 />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
