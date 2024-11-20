const express = require('express');
const router = express.Router();
const {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  applyForOpportunity,
  updateApplicationStatus,
  getMyApplications,
} = require('../controllers/opportunityController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getOpportunities);
router.get('/:id', getOpportunity);

// Student routes
router.get('/my/applications', protect, getMyApplications);
router.post('/:id/apply', protect, applyForOpportunity);

// Admin routes
router.post('/', protect, admin, createOpportunity);
router.put('/:id', protect, admin, updateOpportunity);
router.delete('/:id', protect, admin, deleteOpportunity);
router.put('/:id/application/:applicationId', protect, admin, updateApplicationStatus);

module.exports = router;
