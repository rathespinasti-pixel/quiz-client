"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"

import PageLoading from "@/components/page-loading"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import api from "@/lib/api"
import { Quiz } from "@/types"

export default function DashboardQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get("/my/quizzes").then((r) => setQuizzes(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this quiz?")) return
    await api.delete(`/quizzes/${id}`)
    load()
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">My Quizzes</h1>
        {loading ? (
          <PageLoading />
        ) : quizzes.length === 0 ? (
          <p className="text-muted-foreground">No quizzes created yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {quizzes.map((q) => (
              <Card key={q.id}>
                <CardContent className="flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/quizzes/${q.id}`} className="font-medium">
                      {q.title}
                    </Link>
                    <div className="mt-1 flex gap-2">
                      <span className="text-xs text-muted-foreground">
                        {q.question_count} questions
                      </span>
                      {q.is_public ? (
                        <Badge>Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </div>
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
        )}
      </div>
    </ProtectedRoute>
  )
}
