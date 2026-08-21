import express from 'express';
import {
  sendInvitation,
  getMyInvitations,
  respondToInvitation,
} from '../controllers/invitationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .post(protect, sendInvitation);

router.route('/me').get(protect, getMyInvitations);

router.route('/:id/respond').put(protect, respondToInvitation);

export default router;
