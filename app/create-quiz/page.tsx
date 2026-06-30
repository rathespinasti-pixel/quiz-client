"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import ProtectedRoute from "@/components/ProtectedRoute"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { Category } from "@/types"

export default function CreateQuizPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [categoryId, setCategoryId] = useState<string>("none")
  const [timeLimit, setTimeLimit] = useState<number | "">("")
  const [isPublic, setIsPublic] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await api.post("/quizzes", {
        title,
        description,
        category_id: categoryId !== "none" ? Number(categoryId) : null,
        time_limit: timeLimit || null,
        is_public: isPublic,
      })
      router.push(`/edit-quiz/${res.data.id}`)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4">
        <div>
          <h1 className="text-2xl font-semibold">Create Quiz</h1>
          <p className="text-muted-foreground">
            Set up quiz details. An admin will add questions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {error && <p className="text-sm text-destructive">{error}</p>}

          <Card>
            <CardHeader>
              <CardTitle>Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label>Category</Label>
                  <Select
                    value={categoryId}
                    onValueChange={(value) => setCategoryId(value ?? "none")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="No category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="time_limit">Time Limit (minutes)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is_public"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(checked === true)}
                />
                <Label htmlFor="is_public">Make quiz public</Label>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Quiz"}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  )
}
