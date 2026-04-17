const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController"); // ✅ CORRECT

router.post("/register", register); // ✅ CORRECT
router.post("/login", login);

module.exports = router;