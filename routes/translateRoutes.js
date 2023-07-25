const express = require('express')

// controller functions
const { translateController } = require('../controllers/translateController')

const router = express.Router()

// translateController route
router.post('/', translateController)

module.exports = router
