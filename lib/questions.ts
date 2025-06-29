import { Question, UserProgress } from '../types';

// JSONデータをdynamic importで読み込む
async function loadQuestionsData() {
  const questionsData = await import('../data/questions.json');
  return questionsData.default || questionsData;
}

// JSONから問題を取得
export async function getAllQuestions(): Promise<Question[]> {
  try {
    const questionsData = await loadQuestionsData();
    const questions = questionsData.questions.map((q: {
      id: number;
      question: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
      category: string;
      difficulty: string;
    }) => ({
      id: q.id.toString(),
      question: q.question,
      options: q.options as [string, string, string, string],
      correct_answer: q.correctAnswer,
      explanation: q.explanation,
      category: q.category,
      difficulty: q.difficulty
    }));
    
    return questions;
  } catch (error) {
    throw new Error(`問題の取得に失敗しました: ${(error as Error).message}`);
  }
}

// 未回答の問題を取得
export async function getUnansweredQuestions(answeredQuestionIds: string[]): Promise<Question[]> {
  try {
    const allQuestions = await getAllQuestions();
    return allQuestions.filter(q => !answeredQuestionIds.includes(q.id));
  } catch (error) {
    throw new Error(`未回答問題の取得に失敗しました: ${(error as Error).message}`);
  }
}

// ランダムに問題を1つ選択
export function getRandomQuestion(questions: Question[]): Question | null {
  if (questions.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// 次の問題を取得（未回答からランダム選択）
export async function getNextQuestion(userProgress: UserProgress): Promise<Question | null> {
  try {
    // 未回答の問題を取得
    const unansweredQuestions = await getUnansweredQuestions(userProgress.answeredQuestions);
    
    // 未回答問題がない場合は全問題から選択
    if (unansweredQuestions.length === 0) {
      const allQuestions = await getAllQuestions();
      return getRandomQuestion(allQuestions);
    }
    
    // 未回答問題からランダム選択
    return getRandomQuestion(unansweredQuestions);
  } catch (error) {
    console.error('次の問題取得エラー:', error);
    return null;
  }
}

// カテゴリ別の問題を取得
export async function getQuestionsByCategory(category: string): Promise<Question[]> {
  try {
    const allQuestions = await getAllQuestions();
    return allQuestions.filter(q => q.category === category);
  } catch (error) {
    throw new Error(`カテゴリ別問題の取得に失敗しました: ${(error as Error).message}`);
  }
}

// 難易度別の問題を取得
export async function getQuestionsByDifficulty(difficulty: string): Promise<Question[]> {
  try {
    const allQuestions = await getAllQuestions();
    return allQuestions.filter(q => q.difficulty === difficulty);
  } catch (error) {
    throw new Error(`難易度別問題の取得に失敗しました: ${(error as Error).message}`);
  }
}