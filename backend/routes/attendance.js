const express = require("express");
const router  = express.Router();
const {
  markAttendance,
  markBulkAttendance,
  getAttendance,
  getAttendanceSummary
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/auth");

router.post("/",        protect, markAttendance);
router.post("/bulk",    protect, markBulkAttendance);
router.get("/",         protect, getAttendance);
router.get("/summary",  protect, getAttendanceSummary);

module.exports = router;
