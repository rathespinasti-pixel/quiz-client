"use client"

import { Suspense, useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import PageLoading from "@/components/page-loading"
import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import api from "@/lib/api"
import { Question, StartAttemptResponse } from "@/types"

function TakeQuizContent() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const attemptId = searchParams.get("attempt_id")

  const [attemptData, setAttemptData] = useState<StartAttemptResponse | null>(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Record<number, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)

  useEffect(() => {
    if (!attemptId) {
      router.push(`/quizzes/${id}`)
      return
    }
    const stored = sessionStorage.getItem(`attempt_${id}`)
    if (stored) {
      const data = JSON.parse(stored) as StartAttemptResponse
      setAttemptData(data)
      if (data.time_limit) setTimeLeft(data.time_limit * 60)
    } else {
      router.push(`/quizzes/${id}`)
    }
  }, [id, attemptId, router])

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  useEffect(() => {
    if (timeLeft === 0 && attemptData && !submitting) {
      handleSubmit()
    }
  }, [timeLeft])

  const questions: Question[] = attemptData?.questions || []
  const question = questions[current]

  const handleSelect = (questionId: number, answer: string) => {
    setSelected((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleSubmit = async () => {
    if (!attemptId) return
    setSubmitting(true)
    try {
      const answers = questions
        .map((q) => ({
          question_id: q.id,
          selected_answer: selected[q.id],
        }))
        .filter((a) => a.selected_answer)

      const res = await api.post(`/quizzes/${id}/submit`, {
        attempt_id: Number(attemptId),
        answers,
      })
      sessionStorage.setItem(`result_${attemptId}`, JSON.stringify(res.data))
      router.push(`/results/${attemptId}`)
    } catch {
      alert("Failed to submit. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!attemptData) return <PageLoading />

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {current + 1} / {questions.length}
            </span>
            {timeLeft !== null && (
              <span className={cn(timeLeft < 60 && "text-destructive")}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary"
              style={{ width: `${((current + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {question && (
          <Card>
            <CardHeader>
              <CardTitle>
                {current + 1}. {question.question_text}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{question.marks} mark(s)</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {(question.options || []).map((opt) => (
                <Button
                  key={opt.key}
                  variant={selected[question.id] === opt.key ? "default" : "outline"}
                  className="h-auto justify-start px-4 py-3"
                  onClick={() => handleSelect(question.id, opt.key)}
                >
                  <span className="font-semibold">{opt.key}.</span>
                  {opt.text}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>
            <ChevronLeft />
            Previous
          </Button>
          {current < questions.length - 1 ? (
            <Button className="flex-1" onClick={() => setCurrent((c) => c + 1)}>
              Next
              <ChevronRight />
            </Button>
          ) : (
            <Button className="flex-1" onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default function TakeQuizPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <TakeQuizContent />
    </Suspense>
  )
}
