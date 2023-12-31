const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  fatLossGoal: {
    type: Number,
    required: true,
  },
  weeklyCalorieDeficit: {
    type: Number,
    required: true,
  },
  dailyCalorieDeficit: {
    type: Number,
    required: true,
  },
  targetCaloriesPerDay: {
    type: Number,
    required: true,
  },
  numOfWeeks: {
    type: Number,
  },
  activityLevel: {
    type: String,
    required: true,
    enum: ['low', 'moderate', 'high'],
  },
  tdee: {
    type: Number,
    required: true,
  },
  userDishes: [
    {
      dishName: { type: String, required: true },
      calories: { type: Number, required: true },
      protein_g: { type: Number },
      carbohydrates_total_g: { type: Number },
      fat_total_g: { type: Number },
      fiber_g: { type: Number },
      serving_size_g: { type: Number, default: 100 },
    },
  ],
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

module.exports = User
