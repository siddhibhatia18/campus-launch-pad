import mongoose from 'mongoose';

const savedOpportunitySchema = new mongoose.Schema(
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
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate saved opportunities for the same student
savedOpportunitySchema.index({ student: 1, opportunity: 1 }, { unique: true });

const SavedOpportunity = mongoose.model('SavedOpportunity', savedOpportunitySchema);
export default SavedOpportunity;

