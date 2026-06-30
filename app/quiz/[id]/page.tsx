"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quiz } from "@/types";
import { Brain, Clock, HelpCircle, User, Play, Trophy } from "lucide-react";

export default function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then((r) => setQuiz(r.data))
      .catch(() => setError("Quiz not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStart = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setStarting(true);
    try {
      const res = await api.post(`/quizzes/${id}/attempt`);
      router.push(`/quiz/${id}/play?attempt_id=${res.data.attempt_id}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to start quiz");
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-lg">{error || "Quiz not found"}</p>
        <Link href="/quizzes" className="mt-4 inline-block">
          <Button>Browse Quizzes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-2xl leading-snug">{quiz.title}</CardTitle>
            {quiz.category_name && <Badge>{quiz.category_name}</Badge>}
          </div>
          {quiz.description && (
            <p className="text-gray-500">{quiz.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" />
              {quiz.question_count} questions
            </span>
            {quiz.time_limit && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {quiz.time_limit} seconds
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              by {quiz.creator_username}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <Button className="w-full gap-2 h-12 text-base" onClick={handleStart} disabled={starting}>
            <Play className="w-5 h-5" />
            {starting ? "Starting..." : "Start Quiz"}
          </Button>
          <div className="flex gap-3">
            <Link href={`/leaderboard?quiz_id=${quiz.id}`} className="flex-1">
              <Button variant="outline" className="w-full gap-2">
                <Trophy className="w-4 h-4" />
                Leaderboard
              </Button>
            </Link>
            <Link href="/quizzes" className="flex-1">
              <Button variant="outline" className="w-full">Back</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
