import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  getMyProjects,
  getProjectCandidates,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, createProject)
  .get(getProjects);

router.route('/me/all').get(protect, getMyProjects);

router
  .route('/:id')
  .get(getProjectById)
  .delete(protect, deleteProject);

router.route('/:id/candidates').get(protect, getProjectCandidates);

export default router;
