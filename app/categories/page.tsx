"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import PageLoading from "@/components/page-loading"
import ProtectedRoute from "@/components/ProtectedRoute"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import api from "@/lib/api"
import { Category } from "@/types"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get("/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4">
      <div>
        <h1 className="text-2xl font-semibold">Categories</h1>
        <p className="text-muted-foreground">Browse quizzes by topic</p>
      </div>

      {loading ? (
        <PageLoading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/quizzes?category_id=${cat.id}`}>
              <Card>
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                  <CardDescription>{cat.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
