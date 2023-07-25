const express = require('express')
const {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  deleteAllUsers,
} = require('../controllers/userControllers.js')
const { protect } = require('../middleware/authMiddleware.js')

const router = express.Router()

router.post('/', registerUser)
router.post('/login', authUser)

router
  .get('/profile', protect, getUserProfile)
  .put('/profile', protect, updateUserProfile)
router.delete('/deleteAllUsers', deleteAllUsers)

module.exports = router
