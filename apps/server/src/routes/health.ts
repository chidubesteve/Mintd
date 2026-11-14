import express from 'express';
import { Router } from 'express';

const router: Router = express.Router();

router.get('/', (req, res) => {
    const startedAt = process.hrtime.bigint();
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        responseTime: Number(process.hrtime.bigint() - startedAt) / 1_000_000,
    };
    try {
        res.json({ healthCheck });
    } catch (error) {
        healthCheck.message =
            error instanceof Error ? error.message : String(error);
        console.error('Health check error:', error); // Optional: Log for debugging
        res.status(500).json(healthCheck); // Send response even on error
    }
});

export default router;
