import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema(
  {
    challengeId: {
      type: String,
      required: true,
    },
    memberId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['code', 'quiz', 'tsp'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending_review', 'approved', 'rejected'],
      default: 'pending_review'
    },
    codeSubmission: {
      type: String,
      default: '',
    },
    quizScore: {
      type: Number,
      default: 0,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    passedTestCases: {
      type: Number,
      default: 0,
    },
    totalTestCases: {
      type: Number,
      default: 0,
    },
    contestId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

SubmissionSchema.index({ memberId: 1 });
SubmissionSchema.index({ challengeId: 1 });
SubmissionSchema.index({ contestId: 1 });
SubmissionSchema.index({ memberId: 1, contestId: 1 });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
