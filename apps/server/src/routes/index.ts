import { Router } from 'express';
import authRoutes from './auth.routes';
import healthCheckRoute from './health';
import watchRoutes from './watch.routes';
import adminRoutes from './admin.routes';
import kycRoutes from './kyc.routes';

const router = Router();

router.use('/health', healthCheckRoute);
router.use('/auth', authRoutes);
router.use('/watches', watchRoutes);
router.use('/admin', adminRoutes);
router.use('/kyc', kycRoutes);

// NOTE: /api/webhooks/didit is intentionally NOT mounted here — it needs
// express.raw() ahead of the global express.json() for signature
// verification, so it's mounted directly in index.ts instead. See there.

export default router;
