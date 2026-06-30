"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quiz, Question } from "@/types";
import { Brain, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

function PlayContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const attemptId = searchParams.get("attempt_id");

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) {
      router.push(`/quiz/${id}`);
      return;
    }
    api.get(`/quizzes/${id}`)
      .then((r) => setQuiz(r.data))
      .catch(() => router.push(`/quiz/${id}`))
      .finally(() => setLoading(false));
  }, [id, attemptId, router]);

  const questions: Question[] = quiz?.questions || [];
  const question = questions[current];

  const handleSelect = (questionId: number, optionId: number) => {
    setSelected((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answers = questions.map((q) => ({
        question_id: q.id,
        selected_option_id: selected[q.id],
      })).filter((a) => a.selected_option_id);

      const res = await api.post(`/attempts/${attemptId}/submit`, { answers });
      const result = res.data;
      sessionStorage.setItem(`result_${attemptId}`, JSON.stringify(result));
      router.push(`/quiz/${id}/result?attempt_id=${attemptId}`);
    } catch {
      alert("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        {quiz && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-900 truncate">{quiz.title}</h1>
                <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${((current + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {question && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold leading-snug">
                    {current + 1}. {(question as Question & { text?: string }).text ?? question.question_text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(question.options ?? []).map((option) => {
                    const opt = option as { id?: number; key?: string; text: string }
                    const optionId = opt.id ?? Number(opt.key)
                    return (
                    <button
                      key={optionId}
                      onClick={() => handleSelect(question.id, optionId)}
                      className={cn(
                        "w-full text-left px-4 py-3 rounded-lg border text-sm font-medium transition-all",
                        selected[question.id] === optionId
                          ? "border-indigo-500 bg-indigo-50 text-indigo-800"
                          : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50 text-gray-700"
                      )}
                    >
                      {opt.text}
                    </button>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrent((c) => c - 1)}
                disabled={current === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {current < questions.length - 1 ? (
                <Button
                  className="flex-1 gap-1"
                  onClick={() => setCurrent((c) => c + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(selected).length < questions.length}
                >
                  <Brain className="w-4 h-4" />
                  {submitting ? "Submitting..." : `Submit (${Object.keys(selected).length}/${questions.length} answered)`}
                </Button>
              )}
            </div>

            <div className="flex gap-1 flex-wrap">
              {questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrent(i)}
                  className={cn(
                    "w-8 h-8 rounded text-xs font-medium transition-colors",
                    i === current ? "bg-indigo-600 text-white" :
                    selected[q.id] ? "bg-indigo-100 text-indigo-700" :
                    "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>}>
      <PlayContent />
    </Suspense>
  );
}
