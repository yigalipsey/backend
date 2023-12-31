const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel.js')

const protect = asyncHandler(async (req, res, next) => {
  let token
  console.log('auth'.red.underline)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    console.log('auth'.red.underline)
    try {
      token = req.headers.authorization.split(' ')[1]

      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      req.user = await User.findById(decoded.id).select('-password')

      next()
    } catch (err) {
      console.log('error')
      console.error(err)
      res.status(401)
      throw new Error('אין הרשאה')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('אין הרשאה')
  }
})

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error('אין הרשאה. נדרשת הרשאת מנהל מערכת')
  }
}

module.exports = { protect, isAdmin }
