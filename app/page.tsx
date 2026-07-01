"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import QuizCard from "@/components/QuizCard"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/api"
import { Category, Quiz } from "@/types"

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/quizzes").then((r) => setQuizzes(r.data.slice(0, 8))),
      api.get("/categories").then((r) => setCategories(r.data)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Welcome to QuizHub</h1>
          <p className="text-muted-foreground">
            Create quizzes, challenge friends, and climb the leaderboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/quizzes" />}>
            Browse Quizzes
            <ArrowRight />
          </Button>
          <Button variant="outline" render={<Link href="/register" />}>
            Get Started
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Create Quizzes", desc: "Build quizzes with multiple-choice questions in minutes" },
          { title: "Compete & Score", desc: "Take quizzes and get instant server-side scoring" },
          { title: "Leaderboards", desc: "Rank against other players per quiz and category" },
        ].map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.desc}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      {categories.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Browse by Category</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                className="h-auto justify-start p-4"
                render={<Link href={`/quizzes?category_id=${cat.id}`} />}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Featured Quizzes</h2>
          <Button variant="outline" size="sm" render={<Link href="/quizzes" />}>
            View all
            <ArrowRight />
          </Button>
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
              <CardTitle>No quizzes yet</CardTitle>
              <CardDescription>Be the first to create one.</CardDescription>
            </CardHeader>
            <div className="px-4 pb-4">
              <Button render={<Link href="/register" />}>Get Started</Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quizzes.map((q) => (
              <QuizCard key={q.id} quiz={q} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
