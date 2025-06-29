import { UserProgress } from '../types';

const STORAGE_KEY = 'itpassport_quiz_progress';

// ローカルストレージから進捗データを取得
export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') {
    // サーバーサイドの場合はデフォルト値を返す
    return {
      answeredQuestions: [],
      correctAnswers: 0,
      totalAnswers: 0,
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const progress = JSON.parse(stored) as UserProgress;
      return {
        answeredQuestions: progress.answeredQuestions || [],
        correctAnswers: progress.correctAnswers || 0,
        totalAnswers: progress.totalAnswers || 0,
        lastQuestionId: progress.lastQuestionId,
      };
    }
  } catch (error) {
    console.error('進捗データの読み込みに失敗:', error);
  }

  return {
    answeredQuestions: [],
    correctAnswers: 0,
    totalAnswers: 0,
  };
}

// ローカルストレージに進捗データを保存
export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('進捗データの保存に失敗:', error);
  }
}

// 回答記録の追加
export function addAnsweredQuestion(
  questionId: string,
  isCorrect: boolean
): UserProgress {
  const currentProgress = getUserProgress();
  
  // 重複チェック
  if (currentProgress.answeredQuestions.includes(questionId)) {
    return currentProgress;
  }

  const newProgress: UserProgress = {
    answeredQuestions: [...currentProgress.answeredQuestions, questionId],
    correctAnswers: currentProgress.correctAnswers + (isCorrect ? 1 : 0),
    totalAnswers: currentProgress.totalAnswers + 1,
    lastQuestionId: questionId,
  };

  saveUserProgress(newProgress);
  return newProgress;
}

// 進捗をリセット
export function resetUserProgress(): UserProgress {
  const emptyProgress: UserProgress = {
    answeredQuestions: [],
    correctAnswers: 0,
    totalAnswers: 0,
  };

  saveUserProgress(emptyProgress);
  return emptyProgress;
}

// 正答率を計算
export function calculateAccuracy(progress: UserProgress): number {
  if (progress.totalAnswers === 0) {
    return 0;
  }
  return Math.round((progress.correctAnswers / progress.totalAnswers) * 100);
}

// 問題が回答済みかチェック
export function isQuestionAnswered(questionId: string): boolean {
  const progress = getUserProgress();
  return progress.answeredQuestions.includes(questionId);
}