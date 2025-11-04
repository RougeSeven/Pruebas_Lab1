const mongoose = require('mongoose');

const auditoryLogSchema = new mongoose.Schema({
  auditoryLogId: Number,
  logAction: String,
  logTime: Date,
  accountId: Number,
  processId: Number
});

module.exports = mongoose.model('AuditoryLog', auditoryLogSchema, 'auditoryLog');