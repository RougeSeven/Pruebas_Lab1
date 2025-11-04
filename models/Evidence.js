const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const evidenceSchema = new mongoose.Schema({
  evidenceType: String,
  evidenceName: String,
  filePath: String,
  eventId: Number,
});

// Agrega el plugin para que evidenceId sea autoincremental
evidenceSchema.plugin(AutoIncrement, { inc_field: 'evidenceId' });

module.exports = mongoose.model('Evidence', evidenceSchema, 'evidence');
