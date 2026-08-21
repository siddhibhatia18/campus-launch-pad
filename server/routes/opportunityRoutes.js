import express from 'express';
import {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
} from '../controllers/opportunityController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getOpportunities)
  .post(protect, adminOnly, createOpportunity);

router.route('/:id')
  .get(getOpportunityById)
  .put(protect, adminOnly, updateOpportunity)
  .delete(protect, adminOnly, deleteOpportunity);

export default router;
