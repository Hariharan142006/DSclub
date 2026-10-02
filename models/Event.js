import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      default: '10:00 AM',
    },
    location: {
      type: String,
      default: 'Panimalar Engineering College',
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '/Events/DATAXSCAPE 2K26.jpeg',
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Completed'],
      default: 'Upcoming',
    },
    customQuestions: {
      type: [String],
      default: [],
    },
    formFields: {
      type: Array,
      default: [],
    },
    regOpenDate: {
      type: String,
      default: '',
    },
    regCloseDate: {
      type: String,
      default: '',
    },
    registrationStatus: {
      type: String,
      enum: ['Open', 'Closed', 'Auto'],
      default: 'Auto',
    },
    resources: {
      type: [{
        title: String,
        type: { type: String }, // 'Dataset', 'PDF', 'Link', etc.
        url: String, // base64 or link
        isVisible: { type: Boolean, default: true }
      }],
      default: []
    },
    showResources: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model('Event', EventSchema);
