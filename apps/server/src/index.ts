import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import healthCheckRoute from './routes/index';
import authRoutes from './routes/auth.routes';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(helmet());

connectDB();

app.use('/health', healthCheckRoute);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
