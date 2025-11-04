const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  reminderId: Number,
  title: String,
  dateTime: Date,
  activeFlag: Boolean,
  appointmentId: Number
});

module.exports = mongoose.model('Reminder', reminderSchema, 'reminder');