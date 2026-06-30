"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

import PageLoading from "@/components/page-loading"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import api from "@/lib/api"
import { DashboardData } from "@/types"

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/dashboard")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
        {loading ? (
          <PageLoading />
        ) : data ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Welcome back, {data.user.username}
                </p>
              </div>
              <Button render={<Link href="/create-quiz" />}>
                <PlusCircle />
                Create Quiz
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: "Quizzes Created", value: data.stats.quizzes_created },
                { label: "Total Attempts", value: data.stats.total_attempts },
                { label: "Highest Score", value: `${data.stats.highest_score}%` },
              ].map((stat) => (
                <Card key={stat.label}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{stat.value}</CardTitle>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Quizzes</CardTitle>
                  <Button variant="ghost" size="sm" render={<Link href="/dashboard/quizzes" />}>
                    View all
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.created_quizzes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No quizzes yet.</p>
                  ) : (
                    data.created_quizzes.map((q) => (
                      <Link
                        key={q.id}
                        href={`/quizzes/${q.id}`}
                        className="block border-b py-2 last:border-0"
                      >
                        {q.title}
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Attempts</CardTitle>
                  <Button variant="ghost" size="sm" render={<Link href="/dashboard/attempts" />}>
                    View all
                  </Button>
                </CardHeader>
                <CardContent>
                  {data.recent_attempts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No attempts yet.</p>
                  ) : (
                    data.recent_attempts.map((a) => (
                      <Link
                        key={a.id}
                        href={`/results/${a.id}`}
                        className="flex justify-between border-b py-2 last:border-0"
                      >
                        <span>{a.quiz_title}</span>
                        <span className="font-medium">{a.percentage}%</span>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" render={<Link href="/dashboard/profile" />}>
                Profile
              </Button>
              <Button variant="outline" render={<Link href="/dashboard/quizzes" />}>
                My Quizzes
              </Button>
              <Button variant="outline" render={<Link href="/dashboard/attempts" />}>
                My Attempts
              </Button>
            </div>
          </>
        ) : null}
      </div>
    </ProtectedRoute>
  )
}
