const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['principal', 'teacher', 'student'], required: true },
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' }
});

module.exports = mongoose.model('User', userSchema);