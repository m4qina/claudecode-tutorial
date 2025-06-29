# ITパスポート過去問サイト

This is a [Next.js](https://nextjs.org) project for practicing IT Passport exam questions.

## セットアップ

### 1. 環境変数の設定

`.env.example`を`.env.local`にコピーして、Supabaseの設定を入力してください：

```bash
cp .env.example .env.local
```

`.env.local`に以下の値を設定：
- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー（データインポート用）

### 2. データベースのセットアップ

Supabaseで以下のテーブルを作成してください：

```sql
CREATE TABLE questions (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  options TEXT[] NOT NULL,
  correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
  explanation TEXT NOT NULL,
  category TEXT NOT NULL,
  year INTEGER NOT NULL,
  season TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX idx_questions_category ON questions(category);
CREATE INDEX idx_questions_year_season ON questions(year, season);
```

### 3. 問題データのインポート

サンプル問題データをSupabaseにインポートします：

```bash
npm run import-questions
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリケーションが確認できます。

## プロジェクト構成

```
├── app/                 # Next.js App Router
├── data/               # 問題データ（JSON）
│   └── questions.json  # ITパスポート問題サンプル
├── lib/                # ユーティリティ
│   └── supabase.ts     # Supabaseクライアント設定
├── scripts/            # データ管理スクリプト
│   ├── import-questions.js  # 問題インポートスクリプト（JS版）
│   └── import-questions.ts  # 問題インポートスクリプト（TS版）
└── types/              # TypeScript型定義
    └── question.ts     # 問題データの型定義
```

## データインポート機能

### 機能概要
- JSONファイルからSupabaseへの一括問題データインポート
- データ検証機能（必須フィールド、データ型チェック）
- upsert処理による重複データの安全な更新
- 詳細なエラーレポート

### 使用方法

```bash
# 環境変数を設定後
npm run import-questions
```

### データ形式

```json
{
  "id": 1,
  "question": "問題文",
  "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"],
  "correct_answer": 0,
  "explanation": "解説文",
  "category": "カテゴリ名",
  "year": 2023,
  "season": "春"
}
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
