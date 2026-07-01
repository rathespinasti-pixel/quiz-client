"use client"

import { useState } from "react"

import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage("")
    setError("")
    try {
      await api.get("/auth/profile")
      setMessage("Profile loaded from server. Username updates via admin panel.")
      await refreshProfile()
    } catch {
      setError("Failed to refresh profile")
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto w-full max-w-md p-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {message && <p className="text-sm text-muted-foreground">{message}</p>}
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-col gap-2">
                <Label>Username</Label>
                <Input value={user?.username || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Email</Label>
                <Input value={user?.email || ""} disabled />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Role</Label>
                <Input value={user?.role || ""} disabled />
              </div>
              <Button type="submit" variant="outline">
                Refresh Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
