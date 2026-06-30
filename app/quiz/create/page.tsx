"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Category } from "@/types";
import { PlusCircle, Trash2, Brain } from "lucide-react";

interface OptionForm {
  text: string;
  is_correct: boolean;
}

interface QuestionForm {
  text: string;
  options: OptionForm[];
}

const emptyQuestion = (): QuestionForm => ({
  text: "",
  options: [
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
    { text: "", is_correct: false },
  ],
});

export default function CreateQuizPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [isPublished, setIsPublished] = useState(false);
  const [questions, setQuestions] = useState<QuestionForm[]>([emptyQuestion()]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    api.get("/categories").then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const updateQuestion = (qi: number, field: keyof QuestionForm, value: string) => {
    setQuestions((prev) => prev.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  };

  const updateOption = (qi: number, oi: number, field: keyof OptionForm, value: string | boolean) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => j === oi ? { ...o, [field]: value } : o) }
          : q
      )
    );
  };

  const setCorrectOption = (qi: number, oi: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => ({ ...o, is_correct: j === oi })) }
          : q
      )
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (qi: number) => {
    if (questions.length === 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      const hasCorrect = questions[i].options.some((o) => o.is_correct);
      if (!hasCorrect) {
        setError(`Question ${i + 1} must have one correct answer selected`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await api.post("/quizzes", {
        title,
        description,
        category_id: categoryId || null,
        time_limit: timeLimit || null,
        is_published: isPublished,
        questions,
      });
      router.push(`/quiz/${res.data.id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
          <p className="text-gray-500 mt-1">Build a quiz and share it with the world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quiz Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g. World Geography Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this quiz about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">No category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    placeholder="e.g. 300"
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value ? Number(e.target.value) : "")}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion} className="gap-1">
                <PlusCircle className="w-4 h-4" />
                Add Question
              </Button>
            </div>

            {questions.map((q, qi) => (
              <Card key={qi}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Question {qi + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeQuestion(qi)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Enter question text"
                    value={q.text}
                    onChange={(e) => updateQuestion(qi, "text", e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-400">Click the circle to mark the correct answer</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCorrectOption(qi, oi)}
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            opt.is_correct ? "border-indigo-600 bg-indigo-600" : "border-gray-300 hover:border-indigo-400"
                          }`}
                        >
                          {opt.is_correct && <div className="w-2 h-2 rounded-full bg-white" />}
                        </button>
                        <Input
                          placeholder={`Option ${oi + 1}`}
                          value={opt.text}
                          onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full h-12 text-base gap-2" disabled={loading}>
            <Brain className="w-5 h-5" />
            {loading ? "Creating..." : "Create Quiz"}
          </Button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
