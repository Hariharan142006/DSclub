import mongoose from 'mongoose';

const TSPAccessCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  label: { type: String, default: '', trim: true },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
});

const TSPPoolSchema = new mongoose.Schema({
  id: { type: String, required: true }, // unique rule id
  type: { type: String, enum: ['quiz', 'code', 'tsp'], required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  count: { type: Number, required: true, min: 1 },
  pointsPerQuestion: { type: Number, default: 1, min: 1 },
  availableChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }]
});

const TSPSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isActive: { type: Boolean, default: false },
    timerMinutes: { type: Number, default: 0 }, // 0 = no timer
    timerEnabled: { type: Boolean, default: false },
    timerDurationMinutes: { type: Number, default: 60 },
    timerStatus: { type: String, default: 'stopped' }, // 'stopped', 'running', 'paused', 'ended'
    timerRemainingSeconds: { type: Number, default: 3600 },
    timerLastStartedAt: { type: Date, default: null },
    leaderboardEnabled: { type: Boolean, default: true },
    certificateEnabled: { type: Boolean, default: false },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    challenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    pools: [TSPPoolSchema],
    restrictedMembers: [{ type: String }],
    completedMembers: [{ type: String }],
    violations: [
      {
        memberId: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
    ],
    whitelistEnabled: { type: Boolean, default: false },
    passcodeEnabled: { type: Boolean, default: false },
    passcode: { type: String, default: '', trim: true },
    accessCodes: [TSPAccessCodeSchema],
    whitelistedStudents: [
      {
        identifier: { type: String, required: true },
        rollNo: { type: String, default: '', trim: true },
        name: { type: String, default: '', trim: true },
        registerNo: { type: String, default: '', trim: true },
        email: { type: String, default: '', trim: true },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    activeParticipants: [
      {
        memberId: { type: String },
        name: { type: String },
        joinedAt: { type: Date, default: Date.now },
        passcodeUsed: { type: String, default: '' },
        score: { type: Number, default: 0 },
        status: { type: String, enum: ['in_progress', 'completed', 'disqualified', 'restricted'], default: 'in_progress' },
        completedAt: { type: Date, default: null }
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.TSP || mongoose.model('TSP', TSPSchema);
