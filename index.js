import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";

import authRoutes from "./router/authentication/auth.js";
import adminLoanRoutes from "./router/admin/addLoans.js";
import adminLoanCategoryRoutes from "./router/admin/addCategory.js";
import User from "./models/users.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(
    cors({
        origin: ["http://localhost:5173", "https://saylani-system-frontend-hackathon.vercel.app", "https://saylani-system-frontend.vercel.app"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    })
);

app.use(morgan("tiny"));
app.use(express.json());

// MongoDB Connection with Try-Catch
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error.message);
        process.exit(1); // Stop the server if DB connection fails
    }
};

// Call connectDB once and exit if failure
connectDB();

// API Routes
app.use("/auth", authRoutes);
app.use("/admin", adminLoanRoutes);
app.use("/adminCat", adminLoanCategoryRoutes);

// Home Route to Fetch Users
app.get("/", async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

// Start the server after DB connection
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
