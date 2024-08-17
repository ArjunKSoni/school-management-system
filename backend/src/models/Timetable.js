const mongoose = require('mongoose');

const periodSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true }
});

const timetableSchema = new mongoose.Schema({
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom', required: true },
  periods: [periodSchema]
});

module.exports = mongoose.model('Timetable', timetableSchema);