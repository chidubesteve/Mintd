import { Router } from 'express';
import { createKycSessionHandler } from '../controllers/Kyc.controller';
import { authMiddleware, requireRole } from '../middlewares/Auth.middleware';

const router = Router();

// KYC only applies to collectors — admins have no kycStatus field.
router.use(authMiddleware, requireRole('COLLECTOR'));

// POST /api/kyc/session - start (or resume/resubmit) a Didit verification session
router.post('/session', createKycSessionHandler);

export default router;
