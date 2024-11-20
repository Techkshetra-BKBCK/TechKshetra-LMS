const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a project title'],
    },
    description: {
      type: String,
      required: [true, 'Please add a project description'],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'expert'],
      required: true,
    },
    status: {
      type: String,
      enum: ['planning', 'ongoing', 'completed'],
      default: 'planning',
    },
    technologies: [{
      type: String,
    }],
    githubUrl: {
      type: String,
    },
    demoUrl: {
      type: String,
    },
    thumbnail: {
      type: String,
    },
    collaborators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    resources: [{
      title: String,
      fileUrl: String,
      type: String,
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Project', projectSchema);
