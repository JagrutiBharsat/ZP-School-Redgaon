const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date:      { type: String, required: true },   // "YYYY-MM-DD"
  status:    { type: String, enum: ["Present", "Absent"], default: "Present" }
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
