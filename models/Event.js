const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: String,
  description: String,
  dateStart: Date,
  dateEnd: Date,
  eventId: Number,
  orderIndex: Number,
  processId: {
    type: Number,
    required: true,
    validate: {
      validator: async function (value) {
        const Process = mongoose.model('Process');
        const exists = await Process.exists({ processId: value });
        return exists;
      },
      message: 'El proceso con ese processId no existe.',
    },
  },
});

module.exports = mongoose.model('Event', eventSchema, 'event');
