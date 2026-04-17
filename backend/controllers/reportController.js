const Student    = require("../models/Student");
const Attendance = require("../models/Attendance");
const Marks      = require("../models/Marks");

// GET /api/reports?studentId=
exports.getReport = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      const students = await Student.find();

      const report = await Promise.all(students.map(async (s) => {
        const attendance = await Attendance.find({ studentId: s._id });
        const marks      = await Marks.find({ studentId: s._id });

        const totalDays   = attendance.length;
        const presentDays = attendance.filter(a => a.status === "Present").length;
        const attPct      = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

        const avgMarksPct = marks.length
          ? (marks.reduce((s, m) => s + (m.percentage || 0), 0) / marks.length).toFixed(1)
          : "0.0";

        return {
          student:    { id: s._id, name: s.name, class: s.class, rollNo: s.rollNo },
          attendance: { totalDays, presentDays, attendancePct: attPct + "%" },
          marks:      { examCount: marks.length, avgPercentage: avgMarksPct + "%" }
        };
      }));

      return res.json({ success: true, report });
    }

    // Single student
    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    const attendance = await Attendance.find({ studentId });
    const marks      = await Marks.find({ studentId });

    const totalDays   = attendance.length;
    const presentDays = attendance.filter(a => a.status === "Present").length;
    const attPct      = totalDays ? ((presentDays / totalDays) * 100).toFixed(1) : "0.0";

    res.json({
      success: true,
      report: {
        student:    { id: student._id, name: student.name, class: student.class, rollNo: student.rollNo, mobile: student.mobile },
        attendance: { totalDays, presentDays, absentDays: totalDays - presentDays, attendancePct: attPct + "%" },
        marks:      marks.map(m => ({ exam: m.exam, total: m.total, maxTotal: m.maxTotal, percentage: m.percentage }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
