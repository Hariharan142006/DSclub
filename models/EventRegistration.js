import mongoose from 'mongoose';

const EventRegistrationSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      index: true,
    },
    eventTitle: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    rollNo: {
      type: String,
      trim: true,
    },
    deptYear: {
      type: String,
    },
    customResponses: {
      type: Object,
      default: {},
    },
    formResponses: {
      type: Object,
      default: {},
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, email: 1 }, { unique: true, sparse: true });

export default mongoose.models.EventRegistration || mongoose.model('EventRegistration', EventRegistrationSchema);
