import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema(
  {
    memberId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    department: {
      type: String,
      default: 'AI & Data Science',
    },
    year: {
      type: String,
      default: '1st Year',
    },
    roleInterest: {
      type: String,
      default: 'General Member / Participant',
    },
    linkedin: {
      type: String,
      default: '',
    },
    github: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Member || mongoose.model('Member', MemberSchema);
