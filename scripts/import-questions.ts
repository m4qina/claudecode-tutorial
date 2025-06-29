import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { Question, QuestionImportResult } from '../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function validateQuestion(question: any): Promise<string[]> {
  const errors: string[] = [];
  
  if (!question.id || typeof question.id !== 'number') {
    errors.push('Invalid or missing id');
  }
  
  if (!question.question || typeof question.question !== 'string') {
    errors.push('Invalid or missing question text');
  }
  
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push('Options must be an array of 4 strings');
  }
  
  if (typeof question.correct_answer !== 'number' || 
      question.correct_answer < 0 || 
      question.correct_answer > 3) {
    errors.push('correct_answer must be a number between 0 and 3');
  }
  
  if (!question.explanation || typeof question.explanation !== 'string') {
    errors.push('Invalid or missing explanation');
  }
  
  if (!question.category || typeof question.category !== 'string') {
    errors.push('Invalid or missing category');
  }
  
  if (!question.year || typeof question.year !== 'number') {
    errors.push('Invalid or missing year');
  }
  
  if (!question.season || typeof question.season !== 'string') {
    errors.push('Invalid or missing season');
  }
  
  return errors;
}

async function importQuestions(filePath: string): Promise<QuestionImportResult> {
  try {
    console.log(`Reading questions from ${filePath}...`);
    
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const questions: Question[] = JSON.parse(fileContent);
    
    console.log(`Found ${questions.length} questions to import`);
    
    const result: QuestionImportResult = {
      success: true,
      imported: 0,
      errors: []
    };
    
    for (const question of questions) {
      console.log(`Validating question ${question.id}...`);
      
      const validationErrors = await validateQuestion(question);
      if (validationErrors.length > 0) {
        result.errors.push(`Question ${question.id}: ${validationErrors.join(', ')}`);
        continue;
      }
      
      console.log(`Importing question ${question.id}...`);
      
      const { error } = await supabase
        .from('questions')
        .upsert({
          id: question.id,
          question: question.question,
          options: question.options,
          correct_answer: question.correct_answer,
          explanation: question.explanation,
          category: question.category,
          year: question.year,
          season: question.season
        });
      
      if (error) {
        result.errors.push(`Question ${question.id}: ${error.message}`);
        console.error(`Error importing question ${question.id}:`, error);
      } else {
        result.imported++;
        console.log(`Successfully imported question ${question.id}`);
      }
    }
    
    if (result.errors.length > 0) {
      result.success = false;
    }
    
    return result;
    
  } catch (error) {
    console.error('Failed to import questions:', error);
    return {
      success: false,
      imported: 0,
      errors: [(error as Error).message]
    };
  }
}

async function main() {
  const questionsFilePath = path.join(process.cwd(), 'data', 'questions.json');
  
  if (!fs.existsSync(questionsFilePath)) {
    console.error(`Questions file not found at ${questionsFilePath}`);
    process.exit(1);
  }
  
  console.log('Starting question import process...');
  
  const result = await importQuestions(questionsFilePath);
  
  console.log('\n--- Import Results ---');
  console.log(`Success: ${result.success}`);
  console.log(`Imported: ${result.imported} questions`);
  
  if (result.errors.length > 0) {
    console.log('\nErrors:');
    result.errors.forEach(error => console.log(`- ${error}`));
  }
  
  if (result.success) {
    console.log('\n✅ Import completed successfully!');
  } else {
    console.log('\n❌ Import completed with errors');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}