"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Clock, HelpCircle, Pencil, Play, User } from "lucide-react"

import PageLoading from "@/components/page-loading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Quiz } from "@/types"

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    api
      .get(`/quizzes/${id}`)
      .then((r) => setQuiz(r.data))
      .catch(() => setError("Quiz not found"))
      .finally(() => setLoading(false))
  }, [id])

  const handleStart = async () => {
    if (!user) {
      router.push("/login")
      return
    }
    setStarting(true)
    try {
      const res = await api.post(`/quizzes/${id}/start`)
      sessionStorage.setItem(`attempt_${id}`, JSON.stringify(res.data))
      router.push(`/take-quiz/${id}?attempt_id=${res.data.attempt_id}`)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || "Failed to start quiz")
    } finally {
      setStarting(false)
    }
  }

  const isCreator = user && quiz && (user.id === quiz.creator_id || user.role === "admin")

  if (loading) return <PageLoading />

  if (error || !quiz) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 p-4 py-20">
        <p className="text-muted-foreground">{error || "Quiz not found"}</p>
        <Button render={<Link href="/quizzes" />}>Browse Quizzes</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle>{quiz.title}</CardTitle>
            {quiz.category_name && <Badge variant="secondary">{quiz.category_name}</Badge>}
          </div>
          {quiz.description && <CardDescription>{quiz.description}</CardDescription>}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <HelpCircle className="size-4" />
              {quiz.question_count} questions
            </span>
            {quiz.time_limit && (
              <span className="flex items-center gap-1">
                <Clock className="size-4" />
                {quiz.time_limit} minutes
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="size-4" />
              by {quiz.creator_username}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            className="w-full"
            onClick={handleStart}
            disabled={starting || quiz.question_count === 0}
          >
            <Play />
            {starting ? "Starting..." : quiz.question_count === 0 ? "No Questions Yet" : "Start Quiz"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" render={<Link href={`/leaderboard?quiz_id=${quiz.id}`} />}>
              Leaderboard
            </Button>
            {isCreator && (
              <Button variant="outline" className="flex-1" render={<Link href={`/edit-quiz/${quiz.id}`} />}>
                <Pencil />
                Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
