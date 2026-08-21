import express from 'express';
import {
  getApplications,
  createOrUpdateApplication,
  updateApplicationStatus,
} from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getApplications);
router.post('/:opportunityId', createOrUpdateApplication);
router.patch('/:opportunityId', updateApplicationStatus);

export default router;
