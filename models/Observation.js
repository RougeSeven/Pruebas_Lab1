const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema({
  observationId: Number,
  title: String,
  content: String,
  eventId: Number,
});

module.exports = mongoose.model('Observation', observationSchema, 'observation');
