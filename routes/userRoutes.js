const express = require("express");
const {
  authUser,
  getUserProfile,
  registerUser,
  addDishOfUser,
  updateUserProfile,
  deleteAllUsers,
  deleteDishOfUser,
  ping,
} = require("../controllers/userControllers.js");
const { protect } = require("../middleware/authMiddleware.js");

const router = express.Router();

router.get("/ping", ping);
router.post("/", registerUser);
router.post("/login", authUser);
router.post("/add-dish", protect, addDishOfUser);
router
  .get("/profile", protect, getUserProfile)
  .put("/profile", protect, updateUserProfile);
router.delete("/deleteAllUsers", deleteAllUsers);
router.delete("/deleteDish/:dishId", protect, deleteDishOfUser);

module.exports = router;
