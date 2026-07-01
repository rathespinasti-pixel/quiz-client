"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import QuizCard from "@/components/QuizCard"
import PageLoading from "@/components/page-loading"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { Category, Quiz } from "@/types"

function QuizzesContent() {
  const searchParams = useSearchParams()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get("category_id") ? Number(searchParams.get("category_id")) : null
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    const params: Record<string, string> = {}
    if (search) params.search = search
    if (selectedCategory) params.category_id = String(selectedCategory)

    api
      .get("/quizzes", { params })
      .then((r) => {
        if (!cancelled) setQuizzes(r.data)
      })
      .catch(() => {
        if (!cancelled) setQuizzes([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [search, selectedCategory])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Browse Quizzes</h1>
        <p className="text-muted-foreground">
          Discover and take quizzes created by the community
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Search quizzes..."
          className="max-w-sm"
          value={search}
          onChange={(e) => {
            setLoading(true)
            setSearch(e.target.value)
          }}
        />
        <Button
          variant={selectedCategory === null ? "default" : "outline"}
          size="sm"
          onClick={() => {
            setLoading(true)
            setSelectedCategory(null)
          }}
        >
          All
        </Button>
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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No quizzes found</CardTitle>
            <CardDescription>Try a different search or category.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quizzes.map((q) => (
            <QuizCard key={q.id} quiz={q} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function QuizzesPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <QuizzesContent />
    </Suspense>
  )
}
