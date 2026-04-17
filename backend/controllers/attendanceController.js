const Attendance = require("../models/Attendance");
const Student    = require("../models/Student");

// POST /api/attendance/bulk  — save full class attendance for a date
exports.markBulkAttendance = async (req, res) => {
  try {
    const { records } = req.body;
    // records = [{ studentId, date, status }, ...]
    if (!records || !records.length)
      return res.status(400).json({ success: false, message: "No records provided" });

    const ops = records.map(r => ({
      updateOne: {
        filter: { studentId: r.studentId, date: r.date },
        update: { $set: { status: r.status } },
        upsert: true
      }
    }));

    await Attendance.bulkWrite(ops);
    res.json({ success: true, message: `Attendance saved for ${records.length} students` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance  — single record (kept for dashboard use)
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    const existing = await Attendance.findOne({ studentId, date });
    if (existing) {
      existing.status = status;
      await existing.save();
      return res.json({ success: true, message: "Attendance updated", attendance: existing });
    }
    const attendance = await Attendance.create({ studentId, date, status });
    res.status(201).json({ success: true, message: "Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance?date=&class=&studentId=
exports.getAttendance = async (req, res) => {
  try {
    const filter = {};
    if (req.query.date)      filter.date      = req.query.date;
    if (req.query.studentId) filter.studentId = new (require("mongoose").Types.ObjectId)(req.query.studentId);

    // If filtering by class, get student IDs for that class first
    if (req.query.class) {
      const students = await Student.find({ class: req.query.class }).select("_id");
      filter.studentId = { $in: students.map(s => s._id) };
    }

    const records = await Attendance.find(filter)
      .populate("studentId", "name class rollNo gender image")
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/summary?class=&month=&year=
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { class: cls, month, year } = req.query;

    const students = await Student.find(cls ? { class: cls } : {})
      .select("name class rollNo")
      .sort({ rollNo: 1 });

    // Build date prefix filter
    let dateFilter = {};
    if (year && month) {
      const m = String(month).padStart(2, "0");
      dateFilter = { $regex: `^${year}-${m}` };
    } else if (year) {
      dateFilter = { $regex: `^${year}` };
    }

    const summary = await Promise.all(students.map(async (s) => {
      const query = { studentId: s._id };
      if (dateFilter.$regex) query.date = dateFilter;

      const all     = await Attendance.find(query);
      const present = all.filter(a => a.status === "Present").length;
      const absent  = all.filter(a => a.status === "Absent").length;
      const total   = all.length;
      const pct     = total ? ((present / total) * 100).toFixed(1) : "0.0";

      return {
        student: { id: s._id, name: s.name, class: s.class, rollNo: s.rollNo },
        total, present, absent,
        percentage: pct
      };
    }));

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
