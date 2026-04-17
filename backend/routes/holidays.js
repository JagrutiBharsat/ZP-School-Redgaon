const express = require("express");
const router  = express.Router();
const {
  getHolidays,
  addHoliday,
  deleteHoliday,
  checkHoliday
} = require("../controllers/holidayController");
const { protect } = require("../middleware/auth");

router.get("/check",  protect, checkHoliday);
router.get("/",       protect, getHolidays);
router.post("/",      protect, addHoliday);
router.delete("/:id", protect, deleteHoliday);

module.exports = router;
