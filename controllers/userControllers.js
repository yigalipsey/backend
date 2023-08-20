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
      const responseData = {
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
        numOfWeeks: user.numOfWeeks,
        tdee: user.tdee,
        token: user.generateToken(user._id),
      }

      if (user.userDishes) {
        responseData.userDishes = user.userDishes
      }

      res.json(responseData)
    } else {
      res.status(401).json({ message: 'סיסמא לא נכונה' })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      age,
      weight,
      height,
      gender,
      fatLossGoal,
      numOfWeeks,
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
      numOfWeeks,
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
      numOfWeeks,
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
        fatLossGoal: user.fatLossGoal,
        dailyCalorieDeficit: user.dailyCalorieDeficit,
        weeklyCalorieDeficit: user.weeklyCalorieDeficit,
        activityLevel: user.activityLevel,
        tdee: user.tdee,
        token: user.generateToken(user._id),
      })
    } else {
      throw new Error('Invalid user data')
    }
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
}

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
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      res.status(404)
      throw new Error('User not found')
    }

    user.email = req.body.email || user.email

    if (req.body.password) {
      user.password = req.body.password
    }

    if (req.body.age) {
      console.log('Updating age:', req.body.age)
      user.age = req.body.age
    }

    if (req.body.weight) {
      console.log('Updating weight:', req.body.weight)
      user.weight = req.body.weight
    }

    const updatedUser = await user.save()

    console.log('User updated successfully:', updatedUser) // Log the updated user object

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
      token: updatedUser.generateToken(updatedUser._id),
    })
  } catch (error) {
    console.error('Error:', error) // Log the error
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// @desc    Add a dish to user's array of dishes
// @route   POST /api/users/add-dish
// @access  Private
const addDishOfUser = asyncHandler(async (req, res) => {
  const {
    dishName,
    calories,
    carbohydrates_total_g,
    protein_g,
    fat_total_g,
    fiber_g,
  } = req.body
  const userId = req.user._id

  console.log('Incoming request for adding dish:', dishName, calories)

  try {
    const user = await User.findById(userId)

    if (!user) {
      console.log('User not found.')
      res.status(404)
      throw new Error('User not found')
    }

    if (!user.userDishes) {
      user.userDishes = [] // Initialize the userDishes array if it's not present
    }

    const newDish = {
      dishName,
      calories,
      carbohydrates_total_g,
      protein_g,
      fat_total_g,
      fiber_g,
    }
    user.userDishes.push(newDish)

    const updatedUser = await user.save()
    console.log(updatedUser.userDishes)

    res.status(201).json({
      userDishes: updatedUser.userDishes,
    })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ message: 'Internal Server Error' })
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
    bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age - 150
  } else {
    bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age - 150
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
  addDishOfUser,
  deleteAllUsers,
  updateUserProfile,
}
