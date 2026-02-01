import express from 'express';
import { Router } from 'express';

const router: Router = express.Router();

router.get('/', (req, res) => {
    const healthCheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        responseTime: process.hrtime.bigint(),
    };
    try {
        res.send(healthCheck);
    } catch (error) {
        healthCheck.message =
            error instanceof Error ? error.message : String(error);
        console.error('Health check error:', error); // Optional: Log for debugging
        res.status(500).send(healthCheck); // Send response even on error
    }
});

export default router; 