const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  class:         { type: String, required: true },
  rollNo:        { type: String, required: true },
  mobile:        { type: String },
  address:       { type: String },
  dob:           { type: String },
  gender:        { type: String },
  caste:         { type: String },
  birthPlace:    { type: String },
  motherName:    { type: String },
  regNumber:     { type: String },
  studentId:     { type: String },
  aadhar:        { type: String },
  bankAccount:   { type: String },
  admissionDate: { type: String },
  parentBank:    { type: String },
  parentAadhar:  { type: String },
  image:         { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
