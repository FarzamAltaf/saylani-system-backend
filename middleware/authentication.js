import jwt from "jsonwebtoken";
import 'dotenv/config'
import User from "../models/users";

export async function authenticateUser(req, res, next) {
    try {
        const bearerToken = req?.headers?.authorization;
        const token = req?.headers?.authorization?.split(" ")[1];
        if (!bearerToken) {
            return res.status(403).json({ message: "Access denied. No token provided" });
        }
        const decoded = jwt.verify(token, process.env.AUTH_SECRET);
        if (decoded) {
            const user = await User.findById(decoded._id);
            if (!user) {
                return res.status(403).json({ message: "User not found" });
            }
            req.user = user;
            next();
        } else {
            return res.status(403).json({ message: "Invalid token" });
        }
    } catch (error) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
}


export function authorizeRole(roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Access denied. You do not have the required role" });
        }
        next();
    };
}

export const authenticateStudent = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(403).json({ success: false, message: "No token provided." });
    }
    try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET);
        req.student = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
};
