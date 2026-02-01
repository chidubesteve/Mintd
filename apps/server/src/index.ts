import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import healthCheckRoute from './routes/index';
import { connectDB } from './config/db';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

connectDB();

app.get('/health', healthCheckRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
