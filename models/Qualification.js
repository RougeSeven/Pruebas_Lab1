const mongoose = require('mongoose');

const qualificationSchema = new mongoose.Schema({
  role: String,
  institution: String,
  place: String,
  startYear: Number,
  endYear: Number,
  qualificationId: Number,
  qualificationType: String,
  profileId: Number,
});

module.exports = mongoose.model('Qualification', qualificationSchema, 'qualification');
