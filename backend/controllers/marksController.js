const Marks   = require("../models/Marks");
const Student = require("../models/Student");

// Subject config — matches frontend exactly
const SUBJECTS = {
  "Class 1": {
    core:  ["Marathi", "English", "Math"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 2": {
    core:  ["Marathi", "English", "Math"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 3": {
    core:  ["Marathi", "English", "Math", "Environmental Studies"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 4": {
    core:  ["Marathi", "English", "Math", "Environmental Studies"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 5": {
    core:  ["Marathi", "English", "Math", "Hindi", "Environmental Studies"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 6": {
    core:  ["Marathi", "English", "Math", "Hindi", "Science", "Social Science"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 7": {
    core:  ["Marathi", "English", "Math", "Hindi", "Science", "Social Science"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  }
};

exports.getSubjects = (req, res) => {
  const cls = req.query.class;
  if (!cls || !SUBJECTS[cls])
    return res.status(400).json({ success: false, message: "Invalid class" });
  res.json({ success: true, subjects: SUBJECTS[cls] });
};

// POST /api/marks/bulk  — save all marks for a class+exam at once
exports.saveBulkMarks = async (req, res) => {
  try {
    const { records } = req.body;
    // records = [{ studentId, class, exam, subjects: {}, total, maxTotal, percentage }]
    if (!records || !records.length)
      return res.status(400).json({ success: false, message: "No records provided" });

    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, exam: r.exam },
        update: { $set: {
          class:      r.class,
          subjects:   r.subjects,
          total:      r.total,
          maxTotal:   r.maxTotal,
          percentage: r.percentage
        }},
        upsert: true
      }
    }));

    await Marks.bulkWrite(ops);
    res.json({ success: true, message: `Marks saved for ${records.length} students` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/marks?class=&exam=&studentId=
exports.getMarks = async (req, res) => {
  try {
    const filter = {};
    if (req.query.class)     filter.class     = req.query.class;
    if (req.query.exam)      filter.exam      = req.query.exam;
    if (req.query.studentId) filter.studentId = new (require("mongoose").Types.ObjectId)(req.query.studentId);

    const records = await Marks.find(filter)
      .populate("studentId", "name class rollNo image")
      .sort({ "studentId.rollNo": 1 });

    // Convert Mongoose Map to plain object for each record
    const result = records.map(r => ({
      ...r.toObject(),
      subjects: r.subjects ? Object.fromEntries(r.subjects) : {}
    }));

    res.json({ success: true, count: result.length, records: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/marks/report?class=&exam=  — class topper, avg, pass/fail
exports.getMarksReport = async (req, res) => {
  try {
    const { class: cls, exam } = req.query;
    const filter = {};
    if (cls)  filter.class = cls;
    if (exam) filter.exam  = exam;

    const records = await Marks.find(filter)
      .populate("studentId", "name rollNo");

    if (!records.length)
      return res.json({ success: true, report: null, message: "No data" });

    const total   = records.length;
    const avgPct  = (records.reduce((s, r) => s + r.percentage, 0) / total).toFixed(1);
    const pass    = records.filter(r => r.percentage >= 35).length;
    const topper  = records.reduce((a, b) => a.percentage > b.percentage ? a : b);

    res.json({
      success: true,
      report: { total, avgPct, pass, fail: total - pass, topper }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
