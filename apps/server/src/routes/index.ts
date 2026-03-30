import { Router } from 'express';
import authRoutes from './auth.routes';
import healthCheckRoute from './health';
// import watchRoutes from './watch.routes';

const router = Router();

router.use('/health', healthCheckRoute);
router.use('/auth', authRoutes);
// router.use('/watches', watchRoutes);

export default router;
