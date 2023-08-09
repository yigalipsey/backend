const express = require('express')
// const requireAuth = require('../midellware/requireAuth')

// controller functions
const {
  getDailyIntakeByDate,
  createOrUpdateDailyIntake,
  deleteAllDailyIntakes,
  getConsumedDishes,
} = require('../controllers/dailyIntakeControllers')

const router = express.Router()

// create player route
router.post('/update/:id/', createOrUpdateDailyIntake)
router.get('/:id', getDailyIntakeByDate)
router.get('/consumed/:id', getConsumedDishes)
router.delete('/delete', deleteAllDailyIntakes)

module.exports = router
