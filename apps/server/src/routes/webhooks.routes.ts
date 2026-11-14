import { Router } from 'express';
import { handleDiditWebhook } from '../controllers/Webhook.controller';

const router = Router();

// No authMiddleware here — Didit authenticates itself via the HMAC
// signature verified inside the handler, not a Bearer token.
router.post('/didit', handleDiditWebhook);

export default router;
