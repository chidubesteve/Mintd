import { Router } from 'express';
import { authMiddleware, requireRole } from '../middlewares/Auth.middleware';
import {
    getStatsHandler,
    listPendingReviewWatchesHandler,
    approveWatchHandler,
    rejectWatchHandler,
    listAuditLogHandler,
} from '../controllers/Admin.controller';

const router = Router();

// Every admin route requires a valid session AND the ADMIN role.
router.use(authMiddleware, requireRole('ADMIN'));

router.get('/stats', getStatsHandler);

router.get('/watches/pending-review', listPendingReviewWatchesHandler);
router.post('/watches/:watchId/approve', approveWatchHandler);
router.post('/watches/:watchId/reject', rejectWatchHandler);

router.get('/audit-log', listAuditLogHandler);

export default router;
