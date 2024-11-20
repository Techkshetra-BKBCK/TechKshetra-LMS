const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  commentProject,
  getMyProjects,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);

// Protected routes
router.get('/my/projects', protect, getMyProjects);
router.post('/', protect, createProject);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/like', protect, likeProject);
router.post('/:id/comment', protect, commentProject);

module.exports = router;
