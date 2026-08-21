import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    requirementId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      required: true,
    },
    matchScore: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Declined', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending invitations for the same user and requirement
invitationSchema.index(
  { project: 1, student: 1, requirementId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Pending' } }
);

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
