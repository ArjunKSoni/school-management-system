const express = require('express');
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Create classroom (Principal only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ message: 'Not authorized' });

  try {
    const classroom = new Classroom(req.body);
    await classroom.save();
    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Error creating classroom' });
  }
});

// Get all classrooms
router.get('/', auth, async (req, res) => {
  try {
    const classrooms = await Classroom.find().populate('teacher', 'email');
    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classrooms' });
  }
});

// Assign teacher to classroom (Principal only)
router.put('/:id/assign-teacher', auth, async (req, res) => {
  if (req.user.role !== 'principal') return res.status(403).json({ message: 'Not authorized' });

  try {
    const { teacherId } = req.body;
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { teacher: teacherId },
      { new: true }
    ).populate('teacher', 'email');
    
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    await User.findByIdAndUpdate(teacherId, { classroom: classroom._id });

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning teacher to classroom' });
  }
});

// Assign student to classroom (Principal or Teacher)
router.put('/:id/assign-student', auth, async (req, res) => {
  if (req.user.role !== 'principal' && req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const { studentId } = req.body;
    const classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate('students', 'email');
    
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    await User.findByIdAndUpdate(studentId, { classroom: classroom._id });

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Error assigning student to classroom' });
  }
});

// Get classroom for teacher
router.get('/teacher', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Not authorized' });

  try {
    const classroom = await Classroom.findOne({ teacher: req.user.id }).populate('students', 'email');
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });
    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classroom' });
  }
});

// Get classroom for student
router.get('/student', auth, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ message: 'Not authorized' });

  try {
    const user = await User.findById(req.user.id).populate('classroom');
    if (!user.classroom) return res.status(404).json({ message: 'Classroom not found' });
    
    const classmates = await User.find({ classroom: user.classroom._id, role: 'student' }).select('email');
    
    res.json({ classroom: user.classroom, classmates });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching classroom and classmates' });
  }
});

module.exports = router;