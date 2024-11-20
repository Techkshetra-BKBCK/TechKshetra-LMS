const asyncHandler = require('express-async-handler');
const Course = require('../models/courseModel');
const User = require('../models/userModel');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const { difficulty, search } = req.query;
  let query = {};

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const courses = await Course.find(query)
    .populate('instructor', 'name email')
    .sort('-createdAt');

  res.json(courses);
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email')
    .populate('enrolledStudents', 'name email');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  res.json(course);
});

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    duration,
    topics,
    content,
    price,
  } = req.body;

  const course = await Course.create({
    title,
    description,
    instructor: req.user.id,
    difficulty,
    duration,
    topics,
    content,
    price,
  });

  res.status(201).json(course);
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('instructor', 'name email');

  res.json(updatedCourse);
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  await course.remove();
  res.json({ message: 'Course removed' });
});

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  const user = await User.findById(req.user.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if already enrolled
  if (course.enrolledStudents.includes(req.user.id)) {
    res.status(400);
    throw new Error('Already enrolled in this course');
  }

  course.enrolledStudents.push(req.user.id);
  user.enrolledCourses.push(course._id);

  await course.save();
  await user.save();

  res.json({ message: 'Successfully enrolled in course' });
});

// @desc    Rate course
// @route   POST /api/courses/:id/rate
// @access  Private
const rateCourse = asyncHandler(async (req, res) => {
  const { rating, review } = req.body;
  const course = await Course.findById(req.params.id);

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  // Check if user is enrolled
  if (!course.enrolledStudents.includes(req.user.id)) {
    res.status(400);
    throw new Error('You must be enrolled to rate this course');
  }

  // Check if user has already rated
  const existingRating = course.ratings.find(
    (r) => r.user.toString() === req.user.id
  );

  if (existingRating) {
    existingRating.rating = rating;
    existingRating.review = review;
  } else {
    course.ratings.push({ user: req.user.id, rating, review });
  }

  await course.save();
  res.json({ message: 'Course rated successfully' });
});

// @desc    Get enrolled courses
// @route   GET /api/courses/my/courses
// @access  Private
const getMyCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('enrolledCourses');
  res.json(user.enrolledCourses);
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  rateCourse,
  getMyCourses,
};
