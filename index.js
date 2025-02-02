import express from "express";
import http from 'http';
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";


import "dotenv/config";

import authRoutes from "./router/authentication/auth.js";
import adminLoanRoutes from "./router/admin/addLoans.js";
import adminLoanCategoryRoutes from "./router/admin/addCategory.js";


const app = express();
// const PORT = 4000;
// const server = http.createServer(app);



app.use(
    cors({
        // origin: "http://localhost:5173",
        origin: "https://saylani-system-frontend-hackathon.vercel.app",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

// Logger middleware
app.use(morgan("tiny"));
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            // Deprecated options removed
        });
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

connectDB();


// server.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });




app.use("/auth", authRoutes);
app.use("/admin", adminLoanRoutes);
app.use("/adminCat", adminLoanCategoryRoutes);

app.get("/", async (req, res) => {
    const users = await Users.find();
    res.json(users);
});