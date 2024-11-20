const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  rateCourse,
  getMyCourses,
} = require('../controllers/courseController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCourses);
router.get('/:id', getCourse);

// Student routes
router.get('/my/courses', protect, getMyCourses);
router.post('/:id/enroll', protect, enrollCourse);
router.post('/:id/rate', protect, rateCourse);

// Admin routes
router.post('/', protect, admin, createCourse);
router.put('/:id', protect, admin, updateCourse);
router.delete('/:id', protect, admin, deleteCourse);

module.exports = router;
