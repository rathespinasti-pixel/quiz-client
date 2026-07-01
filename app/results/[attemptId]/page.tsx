"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

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
import { Attempt, SubmitResult } from "@/types"

export default function ResultsPage() {
  const { attemptId } = useParams<{ attemptId: string }>()
  const [result, setResult] = useState<SubmitResult | null>(null)
  const [attempt, setAttempt] = useState<Attempt | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${attemptId}`)
    if (stored) {
      queueMicrotask(() => setResult(JSON.parse(stored)))
    }

    api
      .get(`/attempts/${attemptId}`)
      .then((r) => setAttempt(r.data))
      .catch(() => {})
  }, [attemptId])

  const data =
    result ||
    (attempt
      ? {
          score: attempt.score,
          total_marks: attempt.total_marks,
          percentage: attempt.percentage,
          leaderboard_rank: null,
        }
      : null)

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 p-4">
        {!data ? (
          <Card>
            <CardHeader>
              <CardTitle>Result not found</CardTitle>
            </CardHeader>
            <CardContent>
              <Button render={<Link href="/quizzes" />}>Browse Quizzes</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Quiz Results</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 text-center">
                <div className="text-5xl font-bold">{data.percentage}%</div>
                <p className="text-muted-foreground">
                  Score: {data.score} / {data.total_marks} marks
                </p>
                {result?.leaderboard_rank && (
                  <p className="text-sm font-medium">
                    Leaderboard rank: #{result.leaderboard_rank}
                  </p>
                )}
              </CardContent>
            </Card>

            {result?.answers && (
              <Card>
                <CardHeader>
                  <CardTitle>Answer Review</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {result.answers.map((a) => (
                    <div
                      key={a.question_id}
                      className={cn(
                        "rounded-lg p-3 text-sm",
                        a.is_correct ? "bg-muted" : "bg-destructive/10"
                      )}
                    >
                      Your answer: {a.selected_answer}{" "}
                      {a.is_correct ? "✓" : `✗ (Correct: ${a.correct_answer})`}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              {attempt && (
                <Button variant="outline" className="flex-1" render={<Link href={`/quizzes/${attempt.quiz_id}`} />}>
                  Try Again
                </Button>
              )}
              <Button className="flex-1" render={<Link href="/dashboard/attempts" />}>
                My Attempts
              </Button>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  )
}
