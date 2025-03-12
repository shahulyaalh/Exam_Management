const express = require("express");
const nodemailer = require("nodemailer");
const Exam = require("../models/Exam");
const Student = require("../models/Student");
const Subject = require("../models/Subject");
const Arrear = require("../models/Arrear");

const router = express.Router();

// ✅ Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "aakashbabu75399@gmail.com",
    pass: "gnmesklnazmtgiht", // ✅ Use an App Password!
  },
});

// ✅ Send Hall Ticket via Email (Fully Fixed)
router.post("/send-hallticket", async (req, res) => {
  try {
    const { studentId } = req.body;

    console.log("📩 Incoming request to send Hall Ticket for Student ID:", studentId);

    if (!studentId) {
      console.log("❌ ERROR: No Student ID provided!");
      return res.status(400).json({ message: "❌ Student ID is required" });
    }

    // ✅ Fetch student details
    const student = await Student.findById(studentId);
    if (!student) {
      console.log("❌ ERROR: Student not found!");
      return res.status(404).json({ message: "❌ Student not found" });
    }

    console.log("✅ Student found:", student.name);

    // ✅ Fetch Registered Exam Data (Regular Subjects)
    let exam = await Exam.findOne({ studentId });

    let regularSubjects = [];
    if (exam && exam.subjects.length > 0) {
      const subjectIds = exam.subjects.map((subj) => subj.toString());
      regularSubjects = await Subject.find({ _id: { $in: subjectIds } }).select(
        "subjectName subjectCode examSchedule"
      );
    }

    console.log("✅ Regular Subjects Fetched:", regularSubjects);

    // ✅ Fetch Arrear Subjects from Arrear Collection
    const arrearData = await Arrear.findOne({ regNumber: student.regNumber });

    let arrearSubjects = [];
    if (arrearData && arrearData.arrears.length > 0) {
      console.log("✅ Fetching Arrear Subjects for:", arrearData.arrears);

      arrearSubjects = await Subject.find({
        subjectCode: { $in: arrearData.arrears }, // 🔥 Ensure arrear subjects are matched correctly
      }).select("subjectName subjectCode examSchedule");

      if (arrearSubjects.length === 0) {
        console.log("⚠️ No matching arrear subjects found in Subject collection!");
      }
    } else {
      console.log("⚠️ No Arrear Subjects Found for Student!");
    }

    console.log("✅ Arrear Subjects Fetched:", arrearSubjects);

    // ✅ Merge Regular and Arrear Subjects
    const allSubjects = [
      ...regularSubjects.map((sub) => ({
        name: sub.subjectName,
        code: sub.subjectCode,
        examSchedule: sub.examSchedule || "📅 Not Scheduled",
        type: "✅ Regular",
      })),
      ...arrearSubjects.map((sub) => ({
        name: sub.subjectName,
        code: sub.subjectCode,
        examSchedule: sub.examSchedule || "📅 Not Scheduled",
        type: "❌ Arrear",
      })),
    ];

    console.log("📩 Subjects to be included in Email:", allSubjects);

    // ✅ Format subject list for email
    const subjectDetails = allSubjects
      .map((sub) => `- ${sub.name} (${sub.code}) [${sub.type}] - ${sub.examSchedule}`)
      .join("\n");

    console.log("📩 Preparing email...");

    // ✅ Email Content
    const mailOptions = {
      from: "aakashbabu75399@gmail.com",
      to: student.email,
      subject: "🎟️ Your Hall Ticket",
      text: `
Hello ${student.name},

Your hall ticket is ready for download.

📚 Subjects to Write:
${subjectDetails}

📌 Attendance: ${student.attendance}%
💰 Fees Paid: ${student.feesPaid ? "✅ Yes" : "❌ No"}

Best of luck!
Exam Department
      `,
    };

    // ✅ Send Email
    await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully to:", student.email);
    res.json({ message: "📩 Hall Ticket sent successfully!" });

  } catch (error) {
    console.error("❌ ERROR sending Hall Ticket email:", error);
    res.status(500).json({ message: "❌ Error sending Hall Ticket email", error: error.message });
  }
});

module.exports = router;
