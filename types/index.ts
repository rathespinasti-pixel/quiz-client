export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  question_text: string;
  option_a?: string;
  option_b?: string;
  option_c?: string;
  option_d?: string;
  correct_answer?: string;
  marks: number;
  options?: QuestionOption[];
}

export interface Quiz {
  id: number;
  creator_id: number;
  creator_username: string;
  category_id: number | null;
  category_name: string | null;
  title: string;
  description: string;
  is_public: boolean;
  time_limit: number | null;
  question_count: number;
  total_marks: number;
  created_at: string;
  questions?: Question[];
}

export interface Attempt {
  id: number;
  user_id: number;
  quiz_id: number;
  quiz_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  completed_at: string | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  score: number;
  total_marks?: number;
  percentage?: number;
  total_score?: number;
  completed_at?: string;
}

export interface DashboardData {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
  };
  stats: {
    quizzes_created: number;
    total_attempts: number;
    highest_score: number;
  };
  created_quizzes: Quiz[];
  recent_attempts: Attempt[];
}

export interface SubmitResult {
  attempt_id: number;
  score: number;
  total_marks: number;
  percentage: number;
  answers: {
    question_id: number;
    selected_answer: string;
    correct_answer: string;
    is_correct: boolean;
    marks: number;
  }[];
  leaderboard_rank: number | null;
}

export interface StartAttemptResponse {
  attempt_id: number;
  quiz_id: number;
  total_marks: number;
  time_limit: number | null;
  questions: Question[];
}
