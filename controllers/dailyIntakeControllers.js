const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const DailyIntake = require('../models/dailyIntakeModel')
const { startOfDay, subWeeks } = require('date-fns')
const { utcToZonedTime } = require('date-fns-tz')
const clc = require('cli-color')

// const getDailyIntakeByDates = async (req, res) => {
//   try {
//     const { date } = req.body // Assuming the date is passed as a query parameter

//     console.log(date)

//     const userId = req.params.id
//     const user = await User.findById(userId)

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' })
//     }

//     //date: date,
//     const dailyIntake = await DailyIntake.findOne({
//       user: user._id,
//     })

//     if (!dailyIntake) {
//       return res
//         .status(404)
//         .json({ message: 'Daily intake not found for the specified date' })
//     }

//     res.status(200).json({
//       calories: dailyIntake.calories,
//       protein: dailyIntake.protein,
//       fiber: dailyIntake.fiber,
//       fat: dailyIntake.fat,
//       carbohydrates: dailyIntake.carbohydrates,
//       date: dailyIntake.date,
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ message: 'Internal server error' })
//   }
// }

const getDailyIntakeByDate = async (req, res) => {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const now = new Date()
    const timeZone = 'Asia/Jerusalem'
    const zonedNow = utcToZonedTime(now, timeZone)
    const startOfToday = startOfDay(zonedNow)

    // Calculate the start of the week (one week ago)
    const startOfLastWeek = subWeeks(startOfToday, 1)

    let isTodayIntake = await DailyIntake.findOne({
      user: userId,
      date: { $gte: startOfToday },
    })

    console.log(clc.yellow('isTodayIntake:'), isTodayIntake)

    let lastWeekIntakes = await DailyIntake.find({
      user: userId,
      date: { $gte: startOfLastWeek, $lte: zonedNow }, // Use zonedNow as the end time
    })
    if (isTodayIntake) {
    }
    res.json(lastWeekIntakes)
  } catch (error) {
    console.error('Error fetching last week daily intakes:', error)
    res.status(500).json({ error: 'Failed to fetch last week daily intakes' })
  }
}

const createOrUpdateDailyIntake = async (req, res) => {
  try {
    const { calories, protein, fiber, fat, carbohydrates } = req.body

    console.log(calories, protein, fiber, fat, carbohydrates)

    const userId = req.params.id
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const now = new Date()
    const timeZone = 'Asia/Jerusalem'
    const zonedNow = utcToZonedTime(now, timeZone)
    const startOfToday = startOfDay(zonedNow)

    console.log(startOfToday)

    let todayIntake = await DailyIntake.findOne({
      user: userId,
      date: { $gte: startOfToday },
    })

    if (!todayIntake) {
      console.log(clc.red('no intake for this user today'))

      // Create a new daily intake record for today
      todayIntake = new DailyIntake({
        date: new Date(),
        calories: calories || 0,
        protein: protein || 0,
        fiber: fiber || 0,
        fat: fat || 0,
        carbohydrates: carbohydrates || 0,
        user: userId,
      })
    } else {
      // Update existing daily intake record
      todayIntake.calories += calories || 0
      todayIntake.protein += protein || 0
      todayIntake.fiber += fiber || 0
      todayIntake.fat += fat || 0
      todayIntake.carbohydrates += carbohydrates || 0
    }

    await todayIntake.save()

    // await Promise.all([dailyIntake.save(), user.save()])

    res.status(200).json({ todayIntake: todayIntake })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

// Controller to delete all daily intakes
const deleteAllDailyIntakes = async (req, res) => {
  try {
    await DailyIntake.deleteMany({})
    res.status(200).json({ message: 'All daily intakes deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

module.exports = {
  getDailyIntakeByDate,
  createOrUpdateDailyIntake,
  deleteAllDailyIntakes,
}
