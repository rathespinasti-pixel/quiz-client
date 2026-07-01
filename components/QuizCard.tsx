import Link from "next/link"
import { Clock, HelpCircle, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Quiz } from "@/types"

interface QuizCardProps {
  quiz: Quiz
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle>{quiz.title}</CardTitle>
          {quiz.category_name && <Badge variant="secondary">{quiz.category_name}</Badge>}
        </div>
        {quiz.description && (
          <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="mt-auto flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <HelpCircle className="size-3.5" />
          {quiz.question_count} questions
        </span>
        {quiz.time_limit && (
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" />
            {quiz.time_limit} min
          </span>
        )}
        <span className="flex items-center gap-1">
          <User className="size-3.5" />
          {quiz.creator_username}
        </span>
      </CardContent>
      <CardFooter>
        <Button size="sm" className="w-full" render={<Link href={`/quizzes/${quiz.id}`} />}>
          View Quiz
        </Button>
      </CardFooter>
    </Card>
  )
}
