// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import { User } from '../models/index.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role, healthProfile } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'citizen',
      healthProfile: healthProfile || 'General Public'
    });

    res.status(201).json({ message: "Registration successful", userId: newUser.id });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    if (user.role !== role) {
      return res.status(403).json({ error: `Access denied. This account is not authorized for the ${role} portal.` });
    }

    res.status(200).json({ message: "Login successful", user: { id: user.id, name: user.name, role: user.role } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during authentication." });
  }
};