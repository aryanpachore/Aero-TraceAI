// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import { Citizen, Admin } from '../models/index.js'; // Import BOTH new models

export const register = async (req, res) => {
  try {
    const { name, email, password, role, healthProfile, city } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // Point to the correct database table based on the frontend role
    const TargetModel = role === 'admin' ? Admin : Citizen;

    const existingUser = await TargetModel.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;
    if (role === 'admin') {
      // Admins strictly get a city
      newUser = await Admin.create({
        name,
        email,
        password: hashedPassword,
        city 
      });
    } else {
      // Citizens strictly get a health profile
      newUser = await Citizen.create({
        name,
        email,
        password: hashedPassword,
        healthProfile 
      });
    }

    res.status(201).json({ 
      message: "Registration successful", 
      userId: newUser.id, 
      user: { city: newUser.city } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Point to the correct database table
    const TargetModel = role === 'admin' ? Admin : Citizen;

    // Search ONLY within that table
    const user = await TargetModel.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials or unauthorized access for this portal." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    res.status(200).json({ 
      message: "Login successful", 
      user: { 
        id: user.id, 
        name: user.name, 
        role: user.role, 
        city: user.city // This will be null for citizens, which is perfectly fine
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during authentication." });
  }
};