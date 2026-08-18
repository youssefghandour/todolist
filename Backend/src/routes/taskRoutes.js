import express from 'express';
import { prisma } from "../config/db.js"
import {
  validateCreateTaskPayload,
  validateUpdateTaskPayload,
  validateQueryParams,
  validateId
} from "../utils/validation.js";
import { ApiError, asyncHandler } from "../utils/errorHandler.js";

const router = express.Router();

// Dashboard stats endpoint
router.get('/', asyncHandler(async (req, res) => {
  const [tasksCount, completedTasks, pendingCount, highCount] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "completed" } }),
    prisma.task.count({ where: { status: "pending" } }),
    prisma.task.count({ where: { priority: "high" } })
  ]);

  res.json({
    success: true,
    message: 'Dashboard fetched successfully',
    tasksCount,
    completed: completedTasks,
    pending: pendingCount,
    highTasks: highCount
  });
}));

// Get tasks with filtering, sorting, and pagination
router.get('/tasks', asyncHandler(async (req, res) => {
  // Validate query parameters
  const queryValidation = validateQueryParams(req.query);
  if (!queryValidation.valid) {
    throw new ApiError(400, "Invalid query parameters", { errors: queryValidation.errors });
  }

  const { search, status, priority, category, sortBy, limit, offset } = queryValidation.data;
  const prismaConditions = {};

  // Build Prisma conditions
  if (search) {
    prismaConditions.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ];
  }

  if (status) prismaConditions.status = status;
  if (priority) prismaConditions.priority = priority;
  if (category) prismaConditions.category = category;

  // Build sorting
  let prismaSorting = { createdAt: 'desc' };
  if (sortBy === 'oldest') prismaSorting = { createdAt: 'asc' };
  if (sortBy === 'dueDate') prismaSorting = { dueDate: 'asc' };
  if (sortBy === 'priority') prismaSorting = { priority: 'desc' };

  // Fetch total count and tasks
  const [total, tasks] = await Promise.all([
    prisma.task.count({ where: prismaConditions }),
    prisma.task.findMany({
      where: prismaConditions,
      orderBy: prismaSorting,
      skip: offset,
      take: limit
    })
  ]);

  res.json({
    success: true,
    message: 'Tasks fetched successfully',
    tasks,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    }
  });
}));

// Get single task by ID
router.get('/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.valid) {
    throw new ApiError(400, idValidation.error);
  }

  const task = await prisma.task.findUnique({
    where: { id }
  });

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  res.json({
    success: true,
    message: 'Task fetched successfully',
    task
  });
}));



// Create new task
router.post('/tasks', asyncHandler(async (req, res) => {
  // Validate request body
  const validation = validateCreateTaskPayload(req.body);
  if (!validation.valid) {
    throw new ApiError(400, "Invalid task data", { errors: validation.errors });
  }

  const { title, status, priority, category, description, dueDate } = validation.data;

  const task = await prisma.task.create({
    data: {
      title,
      status: status || "pending",
      priority: priority || "low",
      category: category || "personal",
      description,
      dueDate
    }
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    task
  });
}));


// Update task
router.put('/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.valid) {
    throw new ApiError(400, idValidation.error);
  }

  // Validate request body
  const validation = validateUpdateTaskPayload(req.body);
  if (!validation.valid) {
    throw new ApiError(400, "Invalid task data", { errors: validation.errors });
  }

  const updatedTask = await prisma.task.update({
    where: { id },
    data: validation.data
  });

  res.json({
    success: true,
    message: 'Task updated successfully',
    task: updatedTask
  });
}));

// Delete task
router.delete('/tasks/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ID
  const idValidation = validateId(id);
  if (!idValidation.valid) {
    throw new ApiError(400, idValidation.error);
  }

  await prisma.task.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));


export default router;