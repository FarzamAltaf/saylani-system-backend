import express from "express";
import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../../models/users.js";
import { sendEmail } from "../../utils/email.js";

const router = express.Router();
const tokenBlacklist = new Set();

// Middleware to check token blacklist
const checkTokenBlacklist = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token && tokenBlacklist.has(token)) {
        return res.status(401).json({
            status: false,
            message: "Token is no longer valid",
        });
    }
    next();
};

router.use(checkTokenBlacklist);

// Joi schema for registration
const registerSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    cnic: Joi.string()
        .pattern(/^\d{13}$/)
        .required()
        .messages({
            "string.pattern.base": "CNIC must be a 13-digit number without dashes.",
        }),
    imageUrl: Joi.string().uri().optional(),
});

// Registration route
router.post("/register", async (req, res) => {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message,
        });
    }

    // Check if user already exists
    const user = await User.findOne({ email: value.email });
    if (user) {
        return res.status(403).json({
            status: false,
            message: "Email already exists",
        });
    }

    try {
        // Create user and save to database first
        let newUser = new User({
            ...value,
            imageUrl: req.body.imageUrl,
        });

        newUser = await newUser.save();

        // After saving user, generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000); // Generate OTP

        // Send OTP email
        const emailContent = `
  <p>Dear ${newUser.name},</p>
  <p>Greetings from SMIT Management!</p>
  <p>We are thrilled to welcome you to SMIT. To proceed with the verification of your account, please use the verification code below:</p>
  <h2 style="color: #007bff;">Your Verification Code: ${otp}</h2>
  <p>Please ensure to enter this code on the <a href="http://localhost:5173/verify" target="_blank">verification page</a> to complete your registration process. The code is valid for the next <strong>15 minutes</strong>, so kindly use it at your earliest convenience.</p>
  <p>If you did not request this code or have any questions, feel free to reach out to our support team for assistance.</p>
  <p>Warm regards,<br><strong>SMIT Management</strong><br>
  Email: support@smit.edu.pk<br>
  Phone: +92-333-0000000</p>
`


        await sendEmail(newUser.email, "Verification Code for SMIT Enrollment", emailContent, true);

        // Generate token after saving user and sending email
        const token = jwt.sign(newUser.toObject(), process.env.AUTH_SECRET);

        res.status(201).json({
            status: true,
            message: "User registered successfully. OTP sent to email.",
            data: {
                user: newUser,
                otp,
                token,
            },
        });
    } catch (error) {
        console.error("Error during registration:", error.message);
        return res.status(500).json({
            status: false,
            message: "Registration failed. Could not save user or send OTP email.",
        });
    }
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

router.post("/login", async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            status: false,
            message: error.details[0].message,
        });
    }

    const user = await User.findOne({ email: value.email }).lean();
    if (!user) {
        return res.status(403).json({
            status: false,
            message: "User is not registered",
        });
    }

    const isPasswordValid = await bcrypt.compare(value.password, user.password);
    if (!isPasswordValid) {
        return res.status(403).json({
            status: false,
            message: "Incorrect Credentials",
        });
    }

    const token = jwt.sign(user, process.env.AUTH_SECRET);


    res.status(200).json({
        status: true,
        message: "User login successfully",
        data: { user, token },
    });
});

router.post("/logout", (req, res) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(400).json({
            status: false,
            message: "Token is required for logout",
        });
    }

    jwt.verify(token, process.env.AUTH_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: false,
                message: "Invalid token",
            });
        }

        tokenBlacklist.add(token);

        res.status(200).json({
            status: true,
            message: "User logged out successfully",
        });
    });
});

router.post("/updateProfile", async (req, res) => {
    try {
        const { userId, name, imageUrl } = req.body;

        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "User ID is required",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        user.name = name;
        user.imageUrl = imageUrl;
        await user.save();

        res.status(200).json({
            status: true,
            message: "Profile updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});

router.put("/updatePassword/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;
        console.log("PUT /updatePassword/:userId route hit", req.params.userId);

        if (!password) {
            return res.status(400).json({
                status: false,
                message: "Password is required",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        user.password = hashedPassword;
        user.isUser = true;
        user.status = "updated";
        await user.save();

        const updatedUser = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isUser: user.isUser,
            status: user.status,
        };

        const token = jwt.sign(updatedUser, process.env.AUTH_SECRET);


        res.status(200).json({
            status: true,
            message: "Password updated successfully",
            user: updatedUser,
            token: token
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});




export default router;
