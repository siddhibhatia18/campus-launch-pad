import mongoose from 'mongoose';

const skillRequirementSchema = new mongoose.Schema({
  skill: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
  requiredCount: {
    type: Number,
    required: true,
    min: 1,
  },
  filledCount: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const teamMemberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    required: true, // "Creator" or the name of the skill requirement fulfilled
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const projectSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    deadline: {
      type: String,
      trim: true,
      default: '',
    },
    teamSize: {
      type: Number, // Total size including creator
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['Open', 'Closed'],
      default: 'Open',
    },
    skillRequirements: {
      type: [skillRequirementSchema],
      default: [],
    },
    teamMembers: {
      type: [teamMemberSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
