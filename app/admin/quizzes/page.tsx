"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"

import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Quiz } from "@/types"

export default function AdminQuizzesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])

  useEffect(() => {
    if (!authLoading && user?.role !== "admin") router.push("/dashboard")
  }, [user, authLoading, router])

  const load = () => api.get("/admin/quizzes").then((r) => setQuizzes(r.data)).catch(() => {})

  useEffect(() => {
    if (user?.role === "admin") load()
  }, [user])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this quiz?")) return
    await api.delete(`/admin/quizzes/${id}`)
    load()
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">All Quizzes</h1>
        <div className="flex flex-col gap-2">
          {quizzes.map((q) => (
            <Card key={q.id}>
              <CardContent className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{q.title}</p>
                  <p className="text-sm text-muted-foreground">
                    by {q.creator_username} · {q.question_count} questions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" render={<Link href={`/edit-quiz/${q.id}`} />}>
                    <Pencil />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(q.id)}>
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  )
}
