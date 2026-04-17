const express = require("express");
const router = express.Router();
const controller = require("../controllers/studentController");
const { protect } = require("../middleware/auth");

router.get("/",       protect, controller.getStudents);
router.post("/",      protect, controller.addStudent);
router.get("/:id",    protect, controller.getStudent);
router.put("/:id",    protect, controller.updateStudent);
router.delete("/:id", protect, controller.deleteStudent);

module.exports = router;
