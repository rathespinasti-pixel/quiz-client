"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { PlusCircle, Trash2 } from "lucide-react"

import PageLoading from "@/components/page-loading"
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
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/api"
import { Category, Question, Quiz } from "@/types"

const emptyQuestion = () => ({
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "A",
  marks: 1,
})

export default function EditQuizPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [newQuestion, setNewQuestion] = useState(emptyQuestion())
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api
      .get(`/quizzes/${id}`)
      .then((r) => setQuiz(r.data))
      .catch(() => setError("Quiz not found"))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {})
    load()
  }, [load])

  const handleSave = async () => {
    if (!quiz) return
    setSaving(true)
    try {
      await api.put(`/quizzes/${id}`, {
        title: quiz.title,
        description: quiz.description,
        category_id: quiz.category_id,
        time_limit: quiz.time_limit,
        is_public: quiz.is_public,
      })
      router.push(`/quizzes/${id}`)
    } catch {
      setError("Failed to save quiz")
    } finally {
      setSaving(false)
    }
  }

  const handleAddQuestion = async () => {
    if (!isAdmin) return
    setError("")
    try {
      await api.post(`/quizzes/${id}/questions`, newQuestion)
      setNewQuestion(emptyQuestion())
      load()
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || "Failed to add question")
    }
  }

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Delete this question?")) return
    await api.delete(`/questions/${questionId}`)
    load()
  }

  if (loading) return <PageLoading />

  if (!quiz) {
    return (
      <div className="p-4 text-center text-muted-foreground">Quiz not found</div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4">
        <h1 className="text-2xl font-semibold">Edit Quiz</h1>
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Card>
          <CardHeader>
            <CardTitle>Quiz Details</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>Title</Label>
              <Input value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Description</Label>
              <Textarea
                value={quiz.description || ""}
                onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Category</Label>
                <Select
                  value={quiz.category_id ? String(quiz.category_id) : "none"}
                  onValueChange={(value) =>
                    setQuiz({
                      ...quiz,
                      category_id: !value || value === "none" ? null : Number(value),
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Time Limit (minutes)</Label>
                <Input
                  type="number"
                  value={quiz.time_limit || ""}
                  onChange={(e) =>
                    setQuiz({
                      ...quiz,
                      time_limit: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={quiz.is_public}
                onCheckedChange={(checked) =>
                  setQuiz({ ...quiz, is_public: checked === true })
                }
              />
              <Label>Public</Label>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Quiz"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Questions ({quiz.questions?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {(quiz.questions || []).map((q: Question) => (
              <div key={q.id} className="rounded-lg border p-4">
                <div className="flex justify-between gap-2">
                  <p className="font-medium">{q.question_text}</p>
                  {isAdmin && (
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.id)}>
                      <Trash2 />
                    </Button>
                  )}
                </div>
                <div className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                  <span>A: {q.option_a}</span>
                  <span>B: {q.option_b}</span>
                  <span>C: {q.option_c}</span>
                  <span>D: {q.option_d}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Correct: {q.correct_answer} · {q.marks} mark(s)
                </p>
              </div>
            ))}

            {isAdmin ? (
              <div className="flex flex-col gap-3 border-t pt-4">
                <h3 className="flex items-center gap-2 font-medium">
                  <PlusCircle className="size-4" />
                  Add Question (Admin)
                </h3>
                <Input
                  placeholder="Question text"
                  value={newQuestion.question_text}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, question_text: e.target.value })
                  }
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  {(["option_a", "option_b", "option_c", "option_d"] as const).map((key, i) => (
                    <Input
                      key={key}
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={newQuestion[key]}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, [key]: e.target.value })
                      }
                    />
                  ))}
                </div>
                <div className="flex gap-4">
                  <Select
                    value={newQuestion.correct_answer}
                    onValueChange={(value) =>
                      setNewQuestion({
                        ...newQuestion,
                        correct_answer: value ?? "A",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["A", "B", "C", "D"].map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    className="w-24"
                    placeholder="Marks"
                    value={newQuestion.marks}
                    onChange={(e) =>
                      setNewQuestion({ ...newQuestion, marks: Number(e.target.value) })
                    }
                  />
                </div>
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Only admins can add questions to this quiz.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
