const express = require('express')

const router = express.Router()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require('../models/userModel')

const JWT_SECRET = "a368f7f6548a155f6ea33522dec104c0"

router.post("/login", async (req, res) => {
    console.log("hello bro");
    
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email });
      console.log(user);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  
      // Generate JWT Token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
  
      res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.log(error);
        
      res.status(500).json({ message: "Server error", error });
    }
  });

  router.post("/create-user", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already registered!" });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user with hashed password
        const user = new User({
            name,
            email,
            password: hashedPassword,  // Store encrypted password
        });

        const savedUser = await user.save();
        res.status(201).json({ message: "User created successfully!", data: savedUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router