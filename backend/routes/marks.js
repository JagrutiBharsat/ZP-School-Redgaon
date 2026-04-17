const express = require("express");
const router  = express.Router();
const {
  getSubjects,
  saveBulkMarks,
  getMarks,
  getMarksReport
} = require("../controllers/marksController");
const { protect } = require("../middleware/auth");

router.get("/subjects", protect, getSubjects);
router.get("/report",   protect, getMarksReport);
router.get("/",         protect, getMarks);
router.post("/bulk",    protect, saveBulkMarks);

module.exports = router;
