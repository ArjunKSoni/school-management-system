const express = require('express');
const Timetable = require('../models/Timetable');
const Classroom = require('../models/Classroom');
const auth = require('../middleware/auth');

const router = express.Router();

// Create timetable (Teacher only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Not authorized' });

  try {
    const classroom = await Classroom.findOne({ teacher: req.user.id });
    if (!classroom) return res.status(404).json({ message: 'Classroom not found' });

    const timetable = new Timetable({ ...req.body, classroom: classroom._id });
    await timetable.save();
    res.status(201).json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error creating timetable' });
  }
});

// Get timetable for a classroom
router.get('/classroom/:id', auth, async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ classroom: req.params.id });
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timetable' });
  }
});

// Update timetable (Teacher only)
router.put('/:id', auth, async (req, res) => {
  if (req.user.role !== 'teacher') return res.status(403).json({ message: 'Not authorized' });

  try {
    const timetable = await Timetable.findOneAndUpdate(
      { _id: req.params.id, classroom: req.user.classroom },
      req.body,
      { new: true }
    );
    if (!timetable) return res.status(404).json({ message: 'Timetable not found' });
    res.json(timetable);
  } catch (error) {
    res.status(500).json({ message: 'Error updating timetable' });
  }
});

module.exports = router;