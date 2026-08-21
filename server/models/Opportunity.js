import mongoose from 'mongoose';

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an opportunity title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    organization: {
      type: String,
      required: [true, 'Please provide the organization or company name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify opportunity type'],
      enum: ['Internship', 'Hackathon', 'Job', 'Workshop', 'Competition'],
      default: 'Internship',
    },
    domain: {
      type: String,
      required: [true, 'Please specify the domain'],
      trim: true,
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: 'Remote',
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Online',
    },
    deadline: {
      type: String,
      default: 'Rolling',
    },
    applicationLink: {
      type: String,
      required: [true, 'Please provide an application or registration URL'],
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export default Opportunity;
