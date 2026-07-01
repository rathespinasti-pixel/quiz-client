"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubmitResult } from "@/types";
import { Trophy, Brain, RotateCcw, Home } from "lucide-react";
import { cn } from "@/lib/utils";

function ResultContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attempt_id");
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    const stored = sessionStorage.getItem(`result_${attemptId}`);
    if (stored) {
      queueMicrotask(() => setResult(JSON.parse(stored)));
    }
  }, [attemptId]);

  const getScoreColor = (pct: number) => {
    if (pct >= 80) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (pct: number) => {
    if (pct === 100) return "Perfect Score!";
    if (pct >= 80) return "Excellent!";
    if (pct >= 60) return "Good Job!";
    if (pct >= 40) return "Keep Practicing!";
    return "Better luck next time!";
  };

  return (
    <ProtectedRoute>
      <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
        {!result ? (
          <div className="text-center py-20 text-gray-400">
            <Brain className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Result not found.</p>
            <Link href="/quizzes" className="mt-4 inline-block">
              <Button>Browse Quizzes</Button>
            </Link>
          </div>
        ) : (
          <>
            <Card>
              <CardHeader className="text-center space-y-3">
                <div className="flex justify-center">
                  <div className={cn("p-4 rounded-full", result.percentage >= 80 ? "bg-green-100" : result.percentage >= 50 ? "bg-yellow-100" : "bg-red-100")}>
                    <Trophy className={cn("w-10 h-10", getScoreColor(result.percentage))} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{getScoreLabel(result.percentage)}</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className={cn("text-6xl font-bold", getScoreColor(result.percentage))}>
                  {result.percentage}%
                </div>
                <p className="text-gray-500">
                  You answered <span className="font-semibold text-gray-700">{result.score}</span> out of{" "}
                  <span className="font-semibold text-gray-700">{result.total_marks}</span> questions correctly.
                </p>
                {result.leaderboard_rank && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3">
                    <p className="text-indigo-700 font-medium">
                      🏆 Your leaderboard rank: #{result.leaderboard_rank}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Link href={`/quiz/${id}`} className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </Button>
              </Link>
              <Link href="/quizzes" className="flex-1">
                <Button className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Browse More
                </Button>
              </Link>
            </div>

            <Link href={`/leaderboard?quiz_id=${id}`}>
              <Button variant="outline" className="w-full gap-2">
                <Trophy className="w-4 h-4" />
                View Leaderboard
              </Button>
            </Link>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" /></div>}>
      <ResultContent />
    </Suspense>
  );
}
