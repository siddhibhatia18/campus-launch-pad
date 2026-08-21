import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate',
  },
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  githubLink: {
    type: String,
    trim: true,
  },
});

const studentProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    course: {
      type: String,
      trim: true,
      default: '',
    },
    year: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
    skills: {
      type: [skillSchema],
      default: [],
    },
    interestedDomains: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    projects: {
      type: [projectSchema],
      default: [],
    },
    profileImageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Method to calculate real profile completion percentage based on filled data
studentProfileSchema.methods.calculateCompletion = function () {
  let score = 0;
  // Basic info (20%)
  if (this.college && this.college.trim().length > 0) score += 10;
  if (this.course && this.course.trim().length > 0) score += 5;
  if (this.year && this.year.trim().length > 0) score += 5;

  // Bio (10%)
  if (this.bio && this.bio.trim().length >= 10) score += 10;

  // Skills (30%)
  if (this.skills && this.skills.length >= 3) {
    score += 30;
  } else if (this.skills && this.skills.length > 0) {
    score += this.skills.length * 10;
  }

  // Domains & Interests (20%)
  if (this.interestedDomains && this.interestedDomains.length > 0) score += 10;
  if (this.interests && this.interests.length > 0) score += 10;

  // Projects (20%)
  if (this.projects && this.projects.length >= 2) {
    score += 20;
  } else if (this.projects && this.projects.length === 1) {
    score += 10;
  }

  this.profileCompletion = Math.min(100, score);
  return this.profileCompletion;
};

// Pre-save hook to ensure profile completion is always up to date
studentProfileSchema.pre('save', function (next) {
  this.calculateCompletion();
  next();
});

const StudentProfile = mongoose.model('StudentProfile', studentProfileSchema);
export default StudentProfile;
