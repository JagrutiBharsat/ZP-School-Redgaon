const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  class:     { type: String, required: true },
  exam:      { type: String, required: true },
  subjects:  { type: Map, of: Number, default: {} }, // { "Marathi": 85, "Math": 90, ... }
  total:     { type: Number, default: 0 },
  maxTotal:  { type: Number, default: 0 },
  percentage:{ type: Number, default: 0 }
}, { timestamps: true });

// Unique per student + exam combination
marksSchema.index({ studentId: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model("Marks", marksSchema);
