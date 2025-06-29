'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getNextQuestion } from '../../lib/questions';
import { getUserProgress, addAnsweredQuestion } from '../../utils/localStorage';
import type { UserProgress, QuizState } from '../../types';

export const dynamic = 'force-dynamic';

export default function QuizPage() {
  const router = useRouter();
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestion: null,
    selectedAnswer: null,
    showResult: false,
    isCorrect: false,
  });
  const [progress, setProgress] = useState<UserProgress>({
    answeredQuestions: [],
    correctAnswers: 0,
    totalAnswers: 0,
  });
  const [loading, setLoading] = useState(true);

  // 問題を読み込む
  const loadQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const currentProgress = getUserProgress();
      const question = await getNextQuestion(currentProgress);
      
      if (!question) {
        alert('問題の取得に失敗しました');
        router.push('/');
        return;
      }

      setQuizState({
        currentQuestion: question,
        selectedAnswer: null,
        showResult: false,
        isCorrect: false,
      });
      setProgress(currentProgress);
    } catch (error) {
      console.error('問題読み込みエラー:', error);
      alert('問題の読み込みに失敗しました');
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  // 選択肢を選択
  const handleSelectAnswer = (answerIndex: number) => {
    if (quizState.showResult) return;
    setQuizState(prev => ({ ...prev, selectedAnswer: answerIndex }));
  };

  // 回答を送信
  const handleSubmitAnswer = () => {
    if (quizState.selectedAnswer === null || !quizState.currentQuestion) return;

    const isCorrect = quizState.selectedAnswer === quizState.currentQuestion.correct_answer;
    
    setQuizState(prev => ({
      ...prev,
      showResult: true,
      isCorrect,
    }));

    // 進捗を更新
    const newProgress = addAnsweredQuestion(quizState.currentQuestion.id, isCorrect);
    setProgress(newProgress);
  };

  // 次の問題へ
  const handleNextQuestion = () => {
    loadQuestion();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">問題を読み込み中...</div>
      </div>
    );
  }

  if (!quizState.currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">問題が見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← ホームに戻る
            </button>
            <div className="text-sm text-gray-500">
              問題 {progress.totalAnswers + 1}
            </div>
          </div>
          
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min((progress.totalAnswers / 15) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 問題カード */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              {quizState.currentQuestion.category}
            </span>
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ml-2">
              {quizState.currentQuestion.difficulty}
            </span>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-8">
            {quizState.currentQuestion.question}
          </h2>

          {/* 選択肢 */}
          <div className="space-y-4 mb-8">
            {quizState.currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleSelectAnswer(index)}
                disabled={quizState.showResult}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  quizState.selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${
                  quizState.showResult && quizState.currentQuestion
                    ? index === quizState.currentQuestion.correct_answer
                      ? 'border-green-500 bg-green-50'
                      : quizState.selectedAnswer === index && !quizState.isCorrect
                      ? 'border-red-500 bg-red-50'
                      : 'opacity-50'
                    : ''
                }`}
              >
                <span className="font-semibold mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>

          {/* 結果表示 */}
          {quizState.showResult && (
            <div className={`p-4 rounded-lg mb-6 ${
              quizState.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`font-semibold mb-2 ${
                quizState.isCorrect ? 'text-green-800' : 'text-red-800'
              }`}>
                {quizState.isCorrect ? '✓ 正解！' : '✗ 不正解'}
              </div>
              <p className="text-gray-700">{quizState.currentQuestion.explanation}</p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-center">
            {!quizState.showResult ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={quizState.selectedAnswer === null}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                回答する
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
              >
                次の問題へ
              </button>
            )}
          </div>
        </div>

        {/* 進捗表示 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">現在の進捗</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{progress.totalAnswers}</div>
              <div className="text-sm text-gray-500">回答済み</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{progress.correctAnswers}</div>
              <div className="text-sm text-gray-500">正解数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {progress.totalAnswers > 0 ? Math.round((progress.correctAnswers / progress.totalAnswers) * 100) : 0}%
              </div>
              <div className="text-sm text-gray-500">正答率</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}