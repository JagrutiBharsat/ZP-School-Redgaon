const Holiday = require("../models/Holiday");

// GET /api/holidays  — get all holidays (optionally filter by month: ?month=YYYY-MM)
exports.getHolidays = async (req, res) => {
  try {
    const filter = {};
    if (req.query.month) filter.date = { $regex: `^${req.query.month}` };
    const holidays = await Holiday.find(filter).sort({ date: 1 });
    res.json({ success: true, holidays });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/holidays  — add a holiday
exports.addHoliday = async (req, res) => {
  try {
    const { date, description } = req.body;
    if (!date || !description)
      return res.status(400).json({ success: false, message: "Date and description are required" });

    const existing = await Holiday.findOne({ date });
    if (existing)
      return res.status(400).json({ success: false, message: "Holiday already exists for this date" });

    const holiday = await Holiday.create({ date, description });
    res.status(201).json({ success: true, message: "Holiday added", holiday });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/holidays/:id  — remove a holiday
exports.deleteHoliday = async (req, res) => {
  try {
    const holiday = await Holiday.findByIdAndDelete(req.params.id);
    if (!holiday)
      return res.status(404).json({ success: false, message: "Holiday not found" });
    res.json({ success: true, message: "Holiday removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/holidays/check?date=YYYY-MM-DD  — check if a date is holiday or Sunday
exports.checkHoliday = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date required" });

    // Check Sunday — parse as local date to avoid UTC timezone shift
    const [yr, mo, dy] = date.split("-").map(Number);
    const day = new Date(yr, mo - 1, dy).getDay(); // 0 = Sunday, local time
    if (day === 0) {
      return res.json({ success: true, isHoliday: true, reason: "Sunday — School Closed" });
    }

    // Check saved holidays
    const holiday = await Holiday.findOne({ date });
    if (holiday) {
      return res.json({ success: true, isHoliday: true, reason: holiday.description });
    }

    res.json({ success: true, isHoliday: false, reason: null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
