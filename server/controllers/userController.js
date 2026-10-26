import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from"../lib/cloudinary.js";

// Signup a new user
export const signup = async (req, res) => { 
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio){
            return res.json({success: false, message: "Missing Details" })
        }
        const user = await User.findOne({email});

        if(user){return res.json({success: false, message: "Account already exists" })}

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({fullName, email, password: hashedPassword, bio});

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ success: true, message: "Account created successfully",user: {
            id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            bio: newUser.bio,
            profilePic: newUser.profilePic
        },
        token 
        });
        

        res.json({success: true, userData: newUser, token, message: "Account created successfully"})
    } catch (error) {
            console.log(error.message);
            res.json({success: false, message: error.message})
        }
}
export const checkAuth = (req, res) => {
    try {
        res.json({ success: true, user: req.user });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}   

export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser;

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { bio, fullName }, 
                { new: true }
            );
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            
            updatedUser = await User.findByIdAndUpdate(
                userId, 
                { profilePic: upload.secure_url, bio, fullName }, 
                { new: true }
            );
        }
        
        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
        
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        
        // 2. Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.json({ success: false, message: "Invalid credentials" });
        }
        
        // 3. Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        // 4. Send response
        res.json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                bio: user.bio,
                profilePic: user.profilePic
            },
            token
        });
        
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}