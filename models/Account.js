const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const accountSchema = new mongoose.Schema(
  {
    accountId: {
      type: Number,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: String,
    lastname: String,
    phoneNumber: String,
    email: {
      type: String,
      unique: true,
      required: true,
    },
    resetToken: String,
    tokenExpires: Date,
  },
  { timestamps: true }
);

// 👇 Plugin para autoincrementar el campo accountId
accountSchema.plugin(AutoIncrement, { inc_field: 'accountId' });

// 👇 Fijar nombre de la colección a 'account'
module.exports = mongoose.model('account', accountSchema, 'account');
