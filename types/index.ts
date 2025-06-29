export interface Question {
  id: string;
  question: string;
  options: [string, string, string, string];
  correct_answer: number; // 0-3のインデックス
  explanation: string;
  category: string;
  difficulty: string;
  year?: number;
  season?: string;
}

export interface UserProgress {
  answeredQuestions: string[];
  correctAnswers: number;
  totalAnswers: number;
  lastQuestionId?: string;
}

export interface QuizState {
  currentQuestion: Question | null;
  selectedAnswer: number | null;
  showResult: boolean;
  isCorrect: boolean;
}

export interface QuestionImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}