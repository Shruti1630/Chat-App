import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Middleware to protect routes
export const protectRoute = async (req, res, next) => {
    try {
        // ✅ FIXED: Get token from Authorization header, not "token" header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: "JWT must be provided in Authorization header" 
            });
        }
        
        // Extract token from "Bearer <token>"
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Token is missing" 
            });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user by ID
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Auth middleware error:", error.message);
        
        let errorMessage = "Authentication failed";
        if (error.name === 'JsonWebTokenError') {
            errorMessage = "Invalid token";
        } else if (error.name === 'TokenExpiredError') {
            errorMessage = "Token expired";
        }
        
        return res.status(401).json({ 
            success: false, 
            message: errorMessage 
        });
    }
}