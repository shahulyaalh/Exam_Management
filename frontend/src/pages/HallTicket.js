import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";

const HallTicket = () => {
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchHallTicket = async () => {
      if (!studentId) {
        setMessage({ text: "❌ No student ID found. Please login again.", type: "error" });
        setLoading(false);
        return;
      }

      try {
        // ✅ Prevent caching by adding a timestamp
        const res = await axios.get(`http://localhost:5000/api/hallticket/${studentId}?timestamp=${Date.now()}`);

        console.log("📡 API Response in Frontend:", res.data); // 🔥 Debugging Log
        setStudentInfo(res.data);
      } catch (err) {
        console.error("❌ Error fetching hall ticket data:", err);
        setMessage({ text: "❌ Error fetching hall ticket data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchHallTicket();
  }, [studentId]);

  // ✅ Send Hall Ticket via Email
  const handleDownload = async () => {
    if (!studentInfo?.feesPaid || studentInfo.attendance < 75) {
      alert("⚠️ You must pay the fees and have at least 75% attendance to download the hall ticket.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/exams/send-hallticket", {
        studentId,
      });

      alert(response.data.message);
    } catch (error) {
      console.error("❌ Error sending Hall Ticket email:", error.response?.data || error);
      alert(`⚠️ Error: ${error.response?.data?.message || "Failed to send email"}`);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ padding: 4, marginTop: 4, textAlign: "center" }}>
        <Typography variant="h4">🎟️ Hall Ticket</Typography>

        {message.text && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}

        {loading ? (
          <CircularProgress />
        ) : studentInfo ? (
          <>
            <Box sx={{ textAlign: "left", marginBottom: 2 }}>
              <Typography variant="h6">👤 Name: {studentInfo.studentName}</Typography>
              <Typography variant="h6">📊 Attendance: {studentInfo.attendance}%</Typography>
              <Typography variant="h6">
                💰 Fees Paid: {studentInfo.feesPaid ? "✅ Yes" : "❌ No"}
              </Typography>
            </Box>

            {/* ✅ Display Registered Subjects */}
            <Typography variant="h5" sx={{ marginTop: 2 }}>📌 Subjects to Write:</Typography>

            {studentInfo.subjects && studentInfo.subjects.length > 0 ? (
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell><strong>Subject</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Exam Schedule</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentInfo.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>
                          {subject.type === "arrear" ? (
                            <span style={{ color: "red", fontWeight: "bold" }}>❌ Arrear</span>
                          ) : (
                            <span style={{ color: "green", fontWeight: "bold" }}>✅ Regular</span>
                          )}
                        </TableCell>
                        <TableCell style={{ color: subject.examSchedule ? "black" : "gray" }}>
                          {subject.examSchedule ? subject.examSchedule : "📅 Not Scheduled"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ marginTop: 2, color: "gray" }}>
                ❌ No subjects registered.
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 3, padding: 1.5 }}
              onClick={handleDownload}
            >
              📩 Download & Email Hall Ticket
            </Button>
          </>
        ) : (
          <Typography>No hall ticket found</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default HallTicket;
