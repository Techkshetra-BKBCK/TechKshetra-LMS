const asyncHandler = require('express-async-handler');
const Opportunity = require('../models/opportunityModel');

// @desc    Get all opportunities
// @route   GET /api/opportunities
// @access  Public
const getOpportunities = asyncHandler(async (req, res) => {
  const { type, location, isRemote, search } = req.query;
  let query = { isActive: true };

  if (type) {
    query.type = type;
  }

  if (location) {
    query.location = { $regex: location, $options: 'i' };
  }

  if (isRemote !== undefined) {
    query.isRemote = isRemote === 'true';
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }

  const opportunities = await Opportunity.find(query)
    .populate('postedBy', 'name email')
    .sort('-createdAt');

  res.json(opportunities);
});

// @desc    Get single opportunity
// @route   GET /api/opportunities/:id
// @access  Public
const getOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id)
    .populate('postedBy', 'name email')
    .populate('applicants.user', 'name email');

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  res.json(opportunity);
});

// @desc    Create new opportunity
// @route   POST /api/opportunities
// @access  Private/Admin
const createOpportunity = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    description,
    type,
    location,
    isRemote,
    requirements,
    responsibilities,
    skills,
    salary,
    applicationDeadline,
  } = req.body;

  const opportunity = await Opportunity.create({
    title,
    company,
    description,
    type,
    location,
    isRemote,
    requirements,
    responsibilities,
    skills,
    salary,
    applicationDeadline,
    postedBy: req.user.id,
  });

  res.status(201).json(opportunity);
});

// @desc    Update opportunity
// @route   PUT /api/opportunities/:id
// @access  Private/Admin
const updateOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  const updatedOpportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate('postedBy', 'name email');

  res.json(updatedOpportunity);
});

// @desc    Delete opportunity
// @route   DELETE /api/opportunities/:id
// @access  Private/Admin
const deleteOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  await opportunity.remove();
  res.json({ message: 'Opportunity removed' });
});

// @desc    Apply for opportunity
// @route   POST /api/opportunities/:id/apply
// @access  Private
const applyForOpportunity = asyncHandler(async (req, res) => {
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  // Check if already applied
  if (opportunity.applicants.some((app) => app.user.toString() === req.user.id)) {
    res.status(400);
    throw new Error('Already applied for this opportunity');
  }

  opportunity.applicants.push({
    user: req.user.id,
    status: 'pending',
  });

  await opportunity.save();
  res.json({ message: 'Application submitted successfully' });
});

// @desc    Update application status
// @route   PUT /api/opportunities/:id/application/:applicationId
// @access  Private/Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const opportunity = await Opportunity.findById(req.params.id);

  if (!opportunity) {
    res.status(404);
    throw new Error('Opportunity not found');
  }

  const application = opportunity.applicants.id(req.params.applicationId);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  application.status = status;
  await opportunity.save();

  res.json({ message: 'Application status updated successfully' });
});

// @desc    Get user's applications
// @route   GET /api/opportunities/my/applications
// @access  Private
const getMyApplications = asyncHandler(async (req, res) => {
  const opportunities = await Opportunity.find({
    'applicants.user': req.user.id,
  }).populate('postedBy', 'name email');

  const applications = opportunities.map((opp) => ({
    opportunity: {
      _id: opp._id,
      title: opp.title,
      company: opp.company,
      type: opp.type,
    },
    status: opp.applicants.find(
      (app) => app.user.toString() === req.user.id
    ).status,
    appliedAt: opp.applicants.find(
      (app) => app.user.toString() === req.user.id
    ).appliedAt,
  }));

  res.json(applications);
});

module.exports = {
  getOpportunities,
  getOpportunity,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  applyForOpportunity,
  updateApplicationStatus,
  getMyApplications,
};
