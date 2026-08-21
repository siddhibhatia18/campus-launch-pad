import express from 'express';
import {
  getSavedOpportunities,
  saveOpportunity,
  unsaveOpportunity,
} from '../controllers/savedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getSavedOpportunities);
router.post('/:opportunityId', saveOpportunity);
router.delete('/:opportunityId', unsaveOpportunity);

export default router;
