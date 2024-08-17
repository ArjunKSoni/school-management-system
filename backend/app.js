const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5050;

app.use(cors({ origin: '*' }));

app.use(express.json());

mongoose.connect("mongodb+srv://aksoni0520:2PqiVBY38A7MSMsa@classroom.p5ie5.mongodb.net/?retryWrites=true&w=majority&appName=classroom", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/api/users', require('./src/routes/users'));
app.use('/api/classrooms', require('./src/routes/classrooms'));
app.use('/api/timetables', require('./src/routes/timetables'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));