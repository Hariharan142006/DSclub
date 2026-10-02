import mongoose from 'mongoose';

const TSPSessionSchema = new mongoose.Schema(
  {
    tspId: { type: mongoose.Schema.Types.ObjectId, ref: 'TSP', required: true },
    memberId: { type: String, required: true },
    assignedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    challengePoints: [
      {
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' },
        points: { type: Number, default: 1 }
      }
    ],
    solvedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    startedAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    score: { type: Number, default: 0 },
    passcodeUsed: { type: String, default: '' },
    status: { type: String, enum: ['active', 'completed', 'disqualified'], default: 'active' },
  },
  { timestamps: true }
);

TSPSessionSchema.index({ memberId: 1 });
TSPSessionSchema.index({ tspId: 1 });
TSPSessionSchema.index({ memberId: 1, tspId: 1 }, { unique: true });

export default mongoose.models.TSPSession || mongoose.model('TSPSession', TSPSessionSchema);
