const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  appointmentId: Number,
  type: String,
  date: Date,
  description: String,
  contactInfo: String,
  accountId: Number
});

module.exports = mongoose.model('Appointment', appointmentSchema, 'appointment');