import mongoose from 'mongoose';

const ContestSchema = new mongoose.Schema(
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
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    leaderboardEnabled: {
      type: Boolean,
      default: true,
    },
    challenges: [
      {
        type: String,
      },
    ],
    restrictedMembers: [
      {
        type: String,
      },
    ],
    completedMembers: [
      {
        type: String,
      },
    ],
    violations: [
      {
        memberId: { type: String, required: true },
        count: { type: Number, default: 0 },
      },
    ],
    certificateEnabled: {
      type: Boolean,
      default: false,
    },
    certificateTemplate: {
      title: { type: String, default: 'CERTIFICATE OF PARTICIPATION' },
      subtitle: { type: String, default: 'This is proudly presented to' },
      bodyText: { type: String, default: 'for actively participating in the coding contest [CONTEST_TITLE] organized by the Department of AI & Data Science, Panimalar Engineering College.' },
      signatoryName: { type: String, default: 'Dr. S. Malathi' },
      signatoryTitle: { type: String, default: 'HOD - Dept of AI & DS' },
      accentColor: { type: String, default: '#00f0ff' },
      backgroundImageUrl: { type: String, default: '' }
    },
    certificateRecipients: [
      {
        memberId: { type: String },
        name: { type: String },
        email: { type: String },
        status: { type: String, default: 'sent' },
        error: { type: String },
        sentAt: { type: Date, default: Date.now }
      }
    ],
    timerEnabled: {
      type: Boolean,
      default: false,
    },
    timerDurationMinutes: {
      type: Number,
      default: 60,
    },
    timerStatus: {
      type: String, // 'stopped', 'running', 'paused', 'ended'
      default: 'stopped',
    },
    timerRemainingSeconds: {
      type: Number,
      default: 3600,
    },
    timerLastStartedAt: {
      type: Date,
      default: null,
    },
    whitelistEnabled: {
      type: Boolean,
      default: false,
    },
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
        memberId: { type: String, required: true },
        name: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['in_progress', 'completed', 'disqualified', 'restricted'], default: 'in_progress' },
        score: { type: Number, default: 0 },
        completedAt: { type: Date, default: null }
      }
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Contest || mongoose.model('Contest', ContestSchema);
