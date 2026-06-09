const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const generateToken = require('../config/token');

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Auth working correctly");
});

router.post("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: new Date(0), // expire immediately
  });
  res.status(200).json({ message: "Logged out" });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.trim() });

    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      message: "Login Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existinguser = await User.findOne({ email: email.trim() });
    if (existinguser) {
      return res.status(400).json({ message: "User already Exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password.trim(), salt);
    const newuser = new User({
      name: name.trim(),
      email: email.trim(),
      password: hashedpassword,
      role: role || "user",
    });
    await newuser.save();
    return res.status(201).json({ message: "User Registered Successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;