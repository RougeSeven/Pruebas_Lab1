const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

const processSchema = new mongoose.Schema({
  title: { type: String, required: true },
  offense: String,
  canton: String,
  province: String,
  processId: {
    type: Number,
    unique: true,
    required: true,
  },
  clientGender: String,
  clientAge: Number,
  lastUpdate: { type: Date, default: null },
  accountId: { type: Number, required: true },
  processStatus: { type: String, required: true, default: 'not started' },
  startDate: {
    type: Date,
    default: () => {
      const now = new Date();
      // Restar 5 horas para UTC-5 (Ecuador)
      return new Date(now.getTime() - 5 * 60 * 60 * 1000);
    },
  },
  endDate: Date,
  processNumber: String,
  processType: String,
  processDescription: String,
});

// Middleware para autoincrementar processId antes de validar
processSchema.pre('validate', async function (next) {
  if (this.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'processId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.processId = counter.seq;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Process', processSchema, 'process');
