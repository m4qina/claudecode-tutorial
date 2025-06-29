-- ITパスポート過去問サイト用questionsテーブル作成
-- T1-3: questionsテーブル設計とSQL実行

CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer CHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    explanation TEXT NOT NULL,
    category VARCHAR(50),
    difficulty VARCHAR(20) DEFAULT 'medium',
    year INTEGER,
    season VARCHAR(10),
    question_number INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス設定
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_year_season ON questions(year, season);
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at);

-- RLS (Row Level Security) 設定
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが問題を読み取り可能
CREATE POLICY "Questions are viewable by everyone" ON questions
    FOR SELECT USING (true);

-- 管理者のみが問題を挿入・更新・削除可能（将来の拡張用）
-- 現在は認証なしでも動作するように設定
CREATE POLICY "Questions are insertable by everyone" ON questions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Questions are updatable by everyone" ON questions
    FOR UPDATE USING (true);

CREATE POLICY "Questions are deletable by everyone" ON questions
    FOR DELETE USING (true);

-- updated_at自動更新用関数とトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();