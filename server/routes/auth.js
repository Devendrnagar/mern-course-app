const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "secret";

function validateAuthInput(email, password) {
  if (!email || !password) {
    return "Email and password are required";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters";
  }

  return null;
}

// Signup
router.post("/signup", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password;
    const validationError = validateAuthInput(email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      email,
      password: hashed
    });

    await user.save();
    res.status(201).json({ message: "Signup successful" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const password = req.body.password;
    const validationError = validateAuthInput(email, password);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: { id: user._id, email: user.email } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;