import { Router } from 'express';
import {
    uploadWatchHandler,
    getUserWatchesHandler,
    getWatchDetailsHandler,
} from '../controllers/Watch.controller';
import { authMiddleware } from '../middlewares/Auth.middleware';

const router = Router();

// All watch routes require authentication
router.use(authMiddleware);

// POST /api/watches - Upload a new watch
router.post('/', uploadWatchHandler);

// GET /api/watches - Get all watches for the authenticated user (vault)
router.get('/', getUserWatchesHandler);

// GET /api/watches/:watchId - Get details for a specific watch
router.get('/:watchId', getWatchDetailsHandler);

export default router;
