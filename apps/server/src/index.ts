import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { connectDB } from './config/db';

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
app.use(express.json());
app.use(cookieParser());

connectDB();

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
