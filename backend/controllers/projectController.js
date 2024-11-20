const asyncHandler = require('express-async-handler');
const Project = require('../models/projectModel');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = asyncHandler(async (req, res) => {
  const { difficulty, status, search } = req.query;
  let query = {};

  if (difficulty) {
    query.difficulty = difficulty;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const projects = await Project.find(query)
    .populate('creator', 'name email')
    .populate('collaborators', 'name email')
    .sort('-createdAt');

  res.json(projects);
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('collaborators', 'name email')
    .populate('comments.user', 'name email');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.json(project);
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    technologies,
    githubUrl,
    demoUrl,
  } = req.body;

  const project = await Project.create({
    title,
    description,
    creator: req.user.id,
    difficulty,
    technologies,
    githubUrl,
    demoUrl,
  });

  res.status(201).json(project);
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if user is creator or collaborator
  if (
    project.creator.toString() !== req.user.id &&
    !project.collaborators.includes(req.user.id)
  ) {
    res.status(401);
    throw new Error('Not authorized to update this project');
  }

  const updatedProject = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
    .populate('creator', 'name email')
    .populate('collaborators', 'name email');

  res.json(updatedProject);
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if user is creator
  if (project.creator.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this project');
  }

  await project.remove();
  res.json({ message: 'Project removed' });
});

// @desc    Like project
// @route   POST /api/projects/:id/like
// @access  Private
const likeProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // Check if already liked
  if (project.likes.includes(req.user.id)) {
    project.likes = project.likes.filter(
      (like) => like.toString() !== req.user.id
    );
  } else {
    project.likes.push(req.user.id);
  }

  await project.save();
  res.json({ likes: project.likes });
});

// @desc    Comment on project
// @route   POST /api/projects/:id/comment
// @access  Private
const commentProject = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  project.comments.push({
    user: req.user.id,
    text,
  });

  await project.save();

  const updatedProject = await Project.findById(req.params.id)
    .populate('creator', 'name email')
    .populate('collaborators', 'name email')
    .populate('comments.user', 'name email');

  res.json(updatedProject.comments);
});

// @desc    Get user's projects
// @route   GET /api/projects/my/projects
// @access  Private
const getMyProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    $or: [
      { creator: req.user.id },
      { collaborators: req.user.id },
    ],
  })
    .populate('creator', 'name email')
    .populate('collaborators', 'name email')
    .sort('-createdAt');

  res.json(projects);
});

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  likeProject,
  commentProject,
  getMyProjects,
};
