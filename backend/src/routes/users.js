const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Register user (Principal only)
router.post('/register', auth, async (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ message: 'Not authorized' });

  try {
    const { email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error });
  }
});

// Get all users (Principal only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ message: 'Not authorized' });

  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Update user (Principal only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ message: 'Not authorized' });

  try {
    const { email, role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { email, role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete user (Principal only)
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ message: 'Not authorized' });

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;