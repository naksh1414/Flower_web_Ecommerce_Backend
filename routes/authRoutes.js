import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

const router = express.Router();

// Register Route
router.post("/register", async (req, res) => {
    const { email, password, isAdmin = false } = req.body;
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      // Create new user
      const newUser = new User({ email, password, isAdmin });
      await newUser.save();
  
      // Set session
      req.session.userId = newUser._id;
      res.status(201).json({ message: "User registered successfully", user: newUser });
    } catch (err) {
      res.status(500).json({ message: "Error registering user", error: err.message });
    }
  });

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Set session
    req.session.userId = user._id;
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
    console.log("Logging out user with session ID:", req.sessionID); // Log session ID
  
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
  
      // Clear the session cookie
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV , // Match cookie settings
      });
  
      res.status(200).json({ message: "Logout successful" });
    });
  });
  

// Middleware to check if the user is authenticated
router.get("/isAuthenticated", (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({ isAuthenticated: true });
  }
  res.status(401).json({ isAuthenticated: false });
});

export default router;
