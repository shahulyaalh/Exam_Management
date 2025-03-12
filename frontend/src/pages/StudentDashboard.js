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

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) {
        setMessage({ text: "User not logged in!", type: "error" });
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/student/${studentId}`);
        setStudentData(res.data);
      } catch (err) {
        setMessage({ text: "Error fetching student data", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const handleExamRegister = async () => {
    if (!studentData || studentData.attendance < 75 || !studentData.feesPaid) {
      setMessage({ text: "You are not eligible to register for exams!", type: "error" });
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/exams/register", {
        studentId,
        subjects: studentData.subjects.map((subj) => subj.name), // Registering all subjects
      });
      setMessage({ text: "✅ Exam registered successfully!", type: "success" });
    } catch (err) {
      setMessage({ text: "❌ Error registering for exam.", type: "error" });
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={4} sx={{ padding: 4, marginTop: 4, textAlign: "center" }}>
        <Typography variant="h4">📚 Student Dashboard</Typography>

        {message.text && <Alert severity={message.type} sx={{ mt: 2 }}>{message.text}</Alert>}

        {loading ? (
          <CircularProgress />
        ) : studentData ? (
          <>
            <Box sx={{ textAlign: "left", marginBottom: 2 }}>
              <Typography variant="h6">👤 Name: {studentData.name}</Typography>
              <Typography variant="h6">📊 Attendance: {studentData.attendance}%</Typography>
              <Typography variant="h6">
                💰 Fees Paid: {studentData.feesPaid ? "✅ Yes" : "❌ No"}
              </Typography>
            </Box>

            {/* ✅ Display Regular & Arrear Subjects */}
            <Typography variant="h5" sx={{ marginTop: 2 }}>📌 Subjects to Write:</Typography>

            {studentData.subjects.length > 0 ? (
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell><strong>Subject</strong></TableCell>
                      <TableCell><strong>Type</strong></TableCell>
                      <TableCell><strong>Fees</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentData.subjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>{subject.name}</TableCell>
                        <TableCell>{subject.type === "arrear" ? "❌ Arrear" : "✅ Regular"}</TableCell>
                        <TableCell>{subject.fees === "Paid Separately" ? "💰 Paid Separately" : `₹${subject.fees}`}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ marginTop: 2, color: "gray" }}>
                No subjects registered
              </Typography>
            )}

            {/* ✅ Display Registered Subjects */}
            <Typography variant="h5" sx={{ marginTop: 4 }}>📌 Registered Subjects:</Typography>

            {studentData.registeredSubjects.length > 0 ? (
              <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                      <TableCell><strong>Subject</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentData.registeredSubjects.map((subject, index) => (
                      <TableRow key={index}>
                        <TableCell>{subject}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography sx={{ marginTop: 2, color: "gray" }}>
                No exams registered
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 3, padding: 1.5 }}
              onClick={handleExamRegister}
              disabled={studentData.attendance < 75 || !studentData.feesPaid}
            >
              📝 Register for Exams
            </Button>

            <Button
              variant="contained"
              color="secondary"
              fullWidth
              sx={{ marginTop: 2, padding: 1.5 }}
              onClick={() => window.open(`/hall-ticket/${studentData._id}`, "_blank")}
            >
              🎟️ Download Hall Ticket
            </Button>
          </>
        ) : (
          <Typography>No student data found</Typography>
        )}
      </Paper>
    </Container>
  );
};

export default StudentDashboard;
