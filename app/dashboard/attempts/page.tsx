"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import PageLoading from "@/components/page-loading"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Card, CardContent } from "@/components/ui/card"
import api from "@/lib/api"
import { Attempt } from "@/types"

export default function DashboardAttemptsPage() {
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/my/attempts")
      .then((r) => setAttempts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-4">
        <h1 className="text-2xl font-semibold">My Attempts</h1>
        {loading ? (
          <PageLoading />
        ) : attempts.length === 0 ? (
          <p className="text-muted-foreground">
            No attempts yet.{" "}
            <Link href="/quizzes" className="text-primary underline-offset-4 hover:underline">
              Browse quizzes
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {attempts.map((a) => (
              <Card key={a.id}>
                <CardContent className="flex items-center justify-between">
                  <div>
                    <Link href={`/results/${a.id}`} className="font-medium">
                      {a.quiz_title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {a.completed_at && new Date(a.completed_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{a.percentage}%</p>
                    <p className="text-xs text-muted-foreground">
                      {a.score}/{a.total_marks} marks
                    </p>
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
