"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import PageLoading from "@/components/page-loading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { Category, LeaderboardEntry } from "@/types"

function LeaderboardContent() {
  const searchParams = useSearchParams()
  const quizId = searchParams.get("quiz_id")

  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const url = quizId
      ? `/leaderboard/quiz/${quizId}`
      : selectedCategory
        ? `/leaderboard/category/${selectedCategory}`
        : null

    if (!url) {
      queueMicrotask(() => {
        setEntries([])
        setLoading(false)
      })
      return
    }

    let cancelled = false
    api
      .get(url)
      .then((r) => {
        if (!cancelled) setEntries(r.data)
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [quizId, selectedCategory])

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Ranked by score, percentage, and completion time
        </p>
      </div>

      {!quizId && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setLoading(true)
                setSelectedCategory(cat.id)
              }}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {quizId
              ? "Quiz Rankings"
              : selectedCategory
                ? `${categories.find((c) => c.id === selectedCategory)?.name} Rankings`
                : "Select a category"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {quizId || selectedCategory
                ? "No entries yet."
                : "Choose a category to view rankings."}
            </p>
          ) : (
            <div className="flex flex-col">
              {entries.map((entry) => (
                <div
                  key={`${entry.user_id}-${entry.rank}`}
                  className="flex items-center gap-4 border-b py-3 last:border-0"
                >
                  <span className="w-8 text-center text-sm text-muted-foreground">
                    {entry.rank}
                  </span>
                  <span className="flex-1 font-medium">{entry.username}</span>
                  <div className="text-right">
                    <p className="font-semibold">
                      {entry.total_score ?? entry.score}{" "}
                      {entry.total_score ? "pts" : `/${entry.total_marks}`}
                    </p>
                    {entry.percentage !== undefined && (
                      <p className="text-xs text-muted-foreground">{entry.percentage}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <LeaderboardContent />
    </Suspense>
  )
}
