"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2 } from "lucide-react"

import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Category } from "@/types"

export default function AdminCategoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") router.push("/dashboard")
  }, [user, authLoading, router])

  const load = () => api.get("/categories").then((r) => setCategories(r.data)).catch(() => {})

  useEffect(() => {
    if (user?.role === "admin") load()
  }, [user])

  const handleCreate = async () => {
    await api.post("/categories", { name, description })
    setName("")
    setDescription("")
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Delete category?")) return
    await api.delete(`/categories/${id}`)
    load()
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">Categories</h1>

        <Card>
          <CardContent className="flex flex-wrap gap-2">
            <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Input
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button onClick={handleCreate}>
              <Plus />
              Add
            </Button>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.description}</p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(c.id)}>
                  <Trash2 />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
