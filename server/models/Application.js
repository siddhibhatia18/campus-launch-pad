import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    status: {
      type: String,
      enum: ['Interested', 'Applied'],
      default: 'Interested',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure 1 application tracker record per student per opportunity
applicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
