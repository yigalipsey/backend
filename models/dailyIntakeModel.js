const mongoose = require('mongoose')

const dailyIntakeSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  calories: {
    type: Number,
  },
  protein: {
    type: Number,
  },
  fiber: {
    type: Number,
  },
  fat: {
    type: Number,
  },
  fat_saturated: {
    type: Number,
  },
  cholesterol: {
    type: Number,
  },
  carbohydrates: {
    type: Number,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
})

const dailyIntake = mongoose.model('dailyIntake', dailyIntakeSchema)

module.exports = dailyIntake
