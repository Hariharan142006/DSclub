import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const QuizQuestionSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true, default: 0 }
});

const TestCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, default: '' },
  isHidden: { type: Boolean, default: false }
});

const ChallengeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['code', 'quiz', 'tsp'], required: true, default: 'code' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    points: { type: Number, default: 50 },
    isHidden: { type: Boolean, default: false },
    codeDetails: {
      problemStatement: { type: String, default: '' },
      sampleInput: { type: String, default: '' },
      sampleOutput: { type: String, default: '' },
      testCases: [TestCaseSchema],
    },
    quizQuestions: [QuizQuestionSchema],
  },
  { timestamps: true }
);

const Challenge = mongoose.models.Challenge || mongoose.model('Challenge', ChallengeSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const data = JSON.parse(fs.readFileSync('seed_coding.json', 'utf-8'));
    let count = 0;

    for (const q of data) {
      const challenge = new Challenge({
        title: q.title,
        description: q.description,
        type: 'code',
        difficulty: q.difficulty,
        points: q.points,
        isHidden: false,
        codeDetails: {
          problemStatement: q.problemStatement,
          sampleInput: q.sampleInput,
          sampleOutput: q.sampleOutput,
          testCases: q.testCases
        }
      });
      await challenge.save();
      count++;
    }

    console.log(`Successfully added ${count} coding challenges.`);
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
