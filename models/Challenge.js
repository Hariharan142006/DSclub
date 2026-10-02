import mongoose from 'mongoose';

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
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['code', 'quiz', 'tsp'],
      required: true,
      default: 'code',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    points: {
      type: Number,
      default: 50,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
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

export default mongoose.models.Challenge || mongoose.model('Challenge', ChallengeSchema);
