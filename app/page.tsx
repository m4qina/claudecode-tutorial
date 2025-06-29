'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProgress, calculateAccuracy } from '../utils/localStorage';
import type { UserProgress } from '../types';

export default function Home() {
  const [progress, setProgress] = useState<UserProgress>({
    answeredQuestions: [],
    correctAnswers: 0,
    totalAnswers: 0,
  });

  useEffect(() => {
    setProgress(getUserProgress());
  }, []);

  const accuracy = calculateAccuracy(progress);

  return (
    <div className="min-h-screen p-8">
      <main className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ITパスポート過去問道場
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          ITパスポート試験の過去問を一問一答形式で練習しよう
        </p>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">学習状況</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.totalAnswers}</div>
              <div className="text-sm text-gray-500">回答済み問題</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
              <div className="text-sm text-gray-500">正答率</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{progress.correctAnswers}</div>
              <div className="text-sm text-gray-500">正解数</div>
            </div>
          </div>
        </div>

        <Link href="/quiz">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors">
            問題を始める
          </button>
        </Link>
      </main>
    </div>
  );
}
