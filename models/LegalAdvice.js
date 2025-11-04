const mongoose = require('mongoose');

const legalAdviceSchema = new mongoose.Schema({
  adviceId: Number,
  topic: String,
  content: String
});

module.exports = mongoose.model('LegalAdvice', legalAdviceSchema, 'legalAdvice');