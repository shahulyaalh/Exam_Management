const mongoose = require("mongoose");

const SubjectSchema = new mongoose.Schema({
  subjectCode: { type: String, required: true, unique: true }, // ✅ Subject Code
  subjectName: { type: String, required: true },
  department: { type: String, required: true },
  semester: { type: Number, required: true },
  cost: { type: Number, required: true }, // ✅ Subject Cost
  examSchedule: { type: String, default: "📅 Not Scheduled" }, // ✅ Add this field
});

module.exports = mongoose.model("Subject", SubjectSchema);
