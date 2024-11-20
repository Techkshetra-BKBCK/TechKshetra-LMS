const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
    },
    password: {
      type: String,
      required: [true, 'Please add a password'],
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      default: '',
    },
    enrolledCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    completedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    projects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
