import express from "express";
import User from "../models/User.js"; // Assuming you have a User model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, isAdmin } = req.body;
    const newUser = new User({
      username,
      email,
      isAdmin: isAdmin === true,
      password,
    });
    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      success: true,
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login route

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Use the comparePassword method
    const match = await user.comparePassword(password);
    console.log(match);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials", success: false });
    }

    // Create a token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    res.json({ token, success: true, data: user });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});



export default router;
