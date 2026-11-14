import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import webhooksRoutes from './routes/webhooks.routes';
import { connectDB } from './config/db';
import ngrok from '@ngrok/ngrok';

dotenv.config();

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

// A malformed FRONTEND_URL (e.g. copied from .env.example with the
// "http://localhost:3000 || https://yourfrontendurl.com <when deployed>"
// placeholder still in it) silently breaks CORS for every request — the
// browser reports it to Axios as a bare Network Error with nothing else to
// go on. Logging what we actually parsed makes that failure mode visible
// on startup instead of only showing up as a mystery in the frontend.
console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(morgan('dev'));

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (curl, Postman, server-to-server)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error(`CORS: origin ${origin} not allowed`));
        },
        credentials: true,
    }),
);

app.use(helmet());

// Mounted before express.json() and with its own raw-body parser: Didit's
// webhook signature is an HMAC over the exact bytes they sent, and the
// global JSON parser below would consume (and re-serialize) the body
// before a handler on this path ever saw it, breaking that check.
app.use(
    '/api/webhooks',
    express.raw({ type: '*/*' }),
    webhooksRoutes,
);

app.use(express.json());
app.use(cookieParser());

connectDB();

app.get('/', (_req, res) => {
    res.json({
        service: 'Mintd API',
        message: 'API is running',
        endpoints: { api: '/api/', health: '/api/health' },
    });
});

app.use('/api', apiRoutes);

async function forwardToApp() {
    const forwarder = await ngrok.forward({
        addr: `localhost:${PORT}`,
        authtoken_from_env: true,
        domain: 'remission-agile-eastbound.ngrok-free.dev',
    });
    console.log(`Available at: ${forwarder.url()}`);
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

forwardToApp().catch((error: unknown) => {
    console.error('Failed to start ngrok tunnel:', error);
});
