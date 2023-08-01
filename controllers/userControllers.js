const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  try {
    console.log(req.body)
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      throw new Error('יוזר לא קיים במערכת')
    }
    if (user && (await user.matchPassword(password))) {
      console.log(user)
      res.json({
        _id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        age: user.age,
        fatLossGoal: user.fatLossGoal,
        dailyCalorieDeficit: user.dailyCalorieDeficit,
        weeklyCalorieDeficit: user.weeklyCalorieDeficit,
        activityLevel: user.activityLevel,
        tdee: user.tdee,
        token: user.generateToken(user._id),
      })
    } else {
      res.status(401).json({ message: 'סיסמא לא נכונה' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const registerUser = asyncHandler(async (req, res) => {
  console.log('menase')
  try {
    const {
      email,
      password,
      age,
      weight,
      height,
      gender,
      fatLossGoal,
      weeklyFatLossRate,
      activityLevel,
    } = req.body

    const userExists = await User.findOne({ email })
    if (userExists) {
      throw new Error('יוזר קיים במערכת, עבור לדף הכניסה')
    }

    // Calculate the TDEE
    const tdee = calculateTDEE({
      gender,
      weight,
      height,
      age,
      activityLevel,
    })

    // Calculate the calorie deficit based on the weight loss goal and weekly rate
    const calorieDeficitData = calculateCalorieDeficit(
      fatLossGoal,
      weeklyFatLossRate,
      tdee
    )

    // Extract the relevant data from the calorieDeficitData object
    const { weeklyCalorieDeficit, dailyCalorieDeficit, targetCaloriesPerDay } =
      calorieDeficitData

    const user = await User.create({
      email,
      password,
      age,
      weight,
      height,
      gender,
      activityLevel,
      tdee,
      fatLossGoal,
      weeklyCalorieDeficit,
      dailyCalorieDeficit,
      targetCaloriesPerDay,
    })

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        age: user.age,
        weight: user.weight,
        height: user.height,
        gender: user.gender,
        isAdmin: user.isAdmin,
        token: user.generateToken(user._id),
      })
    } else {
      throw new Error('Invalid user data')
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// @desc   get user profile
// @route  GET /api/users/profile
// @access Privat
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc        Update user profile
// @route       PUT /api/users/profile
// @access      Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  console.log(req.body.address)

  if (user) {
    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.address.address = req.body.address.address || user.address.address
    user.address.city = req.body.address.city || user.address.city
    user.address.postalCode =
      req.body.address.postalCode || user.address.postalCode
    user.address.phoneNumber =
      req.body.address.phoneNumber || user.address.phoneNumber
    if (req.body.password) {
      user.password = req.body.password
    }

    const updateUser = await user.save()

    res.json({
      _id: updateUser._id,
      name: updateUser.name,
      email: updateUser.email,
      address: {
        address: updateUser.address.address,
        city: updateUser.address.city,
        postalCode: updateUser.address.postalCode,
        phoneNumber: updateUser.address.phoneNumber,
      },
      isAdmin: updateUser.isAdmin,
      token: generateToken(updateUser._id),
    })
  } else {
    res.status(404)
    throw new Error('המשתמש לא נמצא')
  }
})

const deleteAllUsers = async () => {
  try {
    const users = await User.find({})

    for (const user of users) {
      await User.deleteOne({ _id: user._id })
    }

    console.log('All users deleted successfully.')
  } catch (error) {
    console.error('Error deleting users:', error)
  }
}

// Calculate the TDEE
const calculateTDEE = (user) => {
  const { gender, weight, height, age, activityLevel } = user
  const BMR_MULTIPLIERS = {
    low: 1.2,
    moderate: 1.55,
    high: 1.9,
  }

  let bmr
  if (gender === 'male') {
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
  }

  // Get the selected activity level multiplier
  const activityMultiplier = BMR_MULTIPLIERS[activityLevel]

  return Math.floor(bmr * activityMultiplier)
}

// Calculate the weekly calorie deficit needed to reach the weight loss goal
const calculateCalorieDeficit = (weightLossGoal, weeksToReachGoal, tdee) => {
  // Calculate the weekly calorie deficit needed to reach the weight loss goal
  const weeklyWeightLoss = weightLossGoal / weeksToReachGoal
  const weeklyCalorieDeficit = weeklyWeightLoss * 7700

  // Optionally, calculate the daily calorie deficit
  const dailyCalorieDeficit = weeklyCalorieDeficit / 7

  // Calculate the target daily calorie intake based on the calorie deficit
  const targetCaloriesPerDay = tdee - dailyCalorieDeficit

  return {
    weeklyCalorieDeficit: Math.floor(weeklyCalorieDeficit),
    dailyCalorieDeficit: Math.floor(dailyCalorieDeficit),
    targetCaloriesPerDay: Math.floor(targetCaloriesPerDay),
  }
}

module.exports = {
  authUser,
  getUserProfile,
  registerUser,
  deleteAllUsers,
  updateUserProfile,
}
