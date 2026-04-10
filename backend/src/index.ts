import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// --- Route Imports ---
import authRoutes from './routes/authRoutes';         // Login/Signup & Profiles
import wasteRoutes from './routes/wasteRoutes';       // AI Scan, Waste Logging, Citizen Stats
import centerRoutes from './routes/centerRoutes'
import pickupRoutes from './routes/pickupRoutes';     // Staff Assignments & Completed Pickups
import rewardRoutes from './routes/rewardRoutes';     // User Points & History
import notificationRoutes from './routes/notificationRoutes'; // Eco-Alerts & Notifications

dotenv.config();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- Static File Serving ---
// Isse tum frontend par kachre ki photos (uploads/waste-logs/...) dikha paoge
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- EcoSarthi API Routes ---
app.use('/api/auth', authRoutes);           // User, Partner & Staff management
app.use('/api/waste', wasteRoutes);         // Main Citizen features (AI analysis & Logging)
app.use('/api/centers' , centerRoutes);
app.use('/api/pickups', pickupRoutes);      // Operations (Assignment & Field Staff tasks)
app.use('/api/rewards', rewardRoutes);      // Point tracking & Badges
app.use('/api/notifications', notificationRoutes); // Status updates & point alerts

// --- Base Health Check ---
app.get('/', (req, res) => {
  res.json({ message: "EcoSarthi Backend is Live! 🌍♻️" });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
     Server running on http://localhost:${PORT}
    `);
});

export default app;