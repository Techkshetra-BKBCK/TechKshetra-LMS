const mongoose = require('mongoose');

const opportunitySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add an opportunity title'],
    },
    company: {
      type: String,
      required: [true, 'Please add a company name'],
    },
    description: {
      type: String,
      required: [true, 'Please add an opportunity description'],
    },
    type: {
      type: String,
      enum: ['job', 'internship', 'project'],
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    isRemote: {
      type: Boolean,
      default: false,
    },
    requirements: [{
      type: String,
    }],
    responsibilities: [{
      type: String,
    }],
    skills: [{
      type: String,
    }],
    salary: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'USD',
      },
    },
    applicationDeadline: {
      type: Date,
      required: true,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    applicants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      status: {
        type: String,
        enum: ['pending', 'reviewed', 'accepted', 'rejected'],
        default: 'pending',
      },
      appliedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Opportunity', opportunitySchema);
