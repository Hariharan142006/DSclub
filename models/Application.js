import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema(
  {
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
    year: {
      type: String,
      required: true,
      default: '1st Year',
    },
    department: {
      type: String,
      required: true,
      default: 'AI & Data Science',
    },
    interest: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    memberId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
