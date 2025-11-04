const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  title: String,
  bio: String,
  address: String,
  profileId: Number,
  profilePicture: String,
  accountId: Number,
});

module.exports = mongoose.model('UserProfile', userProfileSchema, 'userProfile');
