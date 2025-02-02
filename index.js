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
        origin: ["http://localhost:5173", "https://saylani-system-frontend-hackathon.vercel.app"],
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
    }
};

// Call connectDB in a try-catch
try {
    connectDB();
} catch (error) {
    console.error("Error during DB connection:", error.message);
}

// API Routes with Try-Catch
try {
    app.use("/auth", authRoutes);
    app.use("/admin", adminLoanRoutes);
    app.use("/adminCat", adminLoanCategoryRoutes);

    // Home Route to Fetch Users with Try-Catch
    app.get("/", async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            res.status(500).json({ message: "Error fetching users", error: error.message });
        }
    });
} catch (error) {
    console.error("Error in setting up routes:", error.message);
}


try {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error("Error during server startup:", error.message);
}

// Vercel Export
export default app;
