const express = require('express')
// const requireAuth = require('../midellware/requireAuth')

// controller functions
const {
  getDailyIntakeByDate,
  createOrUpdateDailyIntake,
  deleteAllDailyIntakes,
} = require('../controllers/dailyIntakeControllers')

const router = express.Router()

// create player route
router.post('/update/:id/', createOrUpdateDailyIntake)
router.get('/:id', getDailyIntakeByDate)
router.delete('/delete', deleteAllDailyIntakes)

module.exports = router
