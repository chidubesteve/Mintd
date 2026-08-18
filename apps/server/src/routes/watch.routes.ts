import { Router } from 'express';
import {
    uploadWatchHandler,
    getUserWatchesHandler,
    getWatchDetailsHandler,
    getSupportedBrandsHandler,
    getModelsByBrandHandler,
    getReferencesByBrandModelHandler,
} from '../controllers/Watch.controller';
import { authMiddleware } from '../middlewares/Auth.middleware';

const router = Router();

// All watch routes require authentication
router.use(authMiddleware);

// ─── Catalogue lookups (used by the register-watch wizard to verify a
// brand/model/reference against our local WatchCatalogue collection) ───────
// These are declared before the "/:watchId" route below so Express never has
// a chance to treat "catalogue" as a watchId param.

// GET /api/watches/catalogue/brands
router.get('/catalogue/brands', getSupportedBrandsHandler);

// GET /api/watches/catalogue/models?brand=Rolex
router.get('/catalogue/models', getModelsByBrandHandler);

// GET /api/watches/catalogue/references?brand=Rolex&model=Submariner
router.get('/catalogue/references', getReferencesByBrandModelHandler);

// POST /api/watches - Upload a new watch
router.post('/', uploadWatchHandler);

// GET /api/watches - Get all watches for the authenticated user (vault)
router.get('/', getUserWatchesHandler);

// GET /api/watches/:watchId - Get details for a specific watch
router.get('/:watchId', getWatchDetailsHandler);

export default router;
