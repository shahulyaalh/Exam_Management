import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";

const ExamRegistration = () => {
  const [subjects, setSubjects] = useState([]);  // Store available subjects
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Store selected subjects
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [studentInfo, setStudentInfo] = useState(null); 

  const studentId = localStorage.getItem("studentId");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!studentId) {
          setMessage({ text: "User not logged in!", type: "error" });
          return;
        }

        // ✅ Fetch subjects and student data
        const [subjectRes, studentRes] = await Promise.all([
          axios.get("http://localhost:5000/api/exams/subjects"), // ✅ Corrected API route
          axios.get(`http://localhost:5000/api/student/${studentId}`), // ✅ Corrected API route
        ]);

        setSubjects(subjectRes.data);
        setStudentInfo(studentRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMessage({ text: "Error fetching data", type: "error" });
      }
    };
    fetchData();
  }, [studentId]);

  const handleSubjectChange = (subject) => {
    setSelectedSubjects((prev) =>
      prev.some((s) => s._id === subject._id)
        ? prev.filter((s) => s._id !== subject._id)
        : [...prev, subject]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!studentInfo) {
      setMessage({ text: "No student data found!", type: "error" });
      return;
    }

    if (studentInfo.attendance < 75) {
      setMessage({ text: "Attendance must be at least 75% to register!", type: "error" });
      return;
    }

    if (!studentInfo.feesPaid) {
      setMessage({ text: "Fees must be paid before registering.", type: "error" });
      return;
    }

    if (selectedSubjects.length === 0) {
      setMessage({ text: "Please select at least one subject.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/exams/register-exam", {
        studentId,
        subjects: selectedSubjects.map((sub) => sub._id), // ✅ Send Subject IDs instead of names
      });

      setMessage({ text: res.data.message, type: "success" });
      setSelectedSubjects([]); // ✅ Clear selected subjects after successful registration
    } catch (err) {
      setMessage({ text: "Error registering for the exam", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} style={{ padding: 20, marginTop: 30 }}>
        <Typography variant="h4" align="center">Exam Registration</Typography>

        {message.text && <Alert severity={message.type} style={{ marginBottom: 10 }}>{message.text}</Alert>}

        {studentInfo && (
          <>
            <Typography variant="h6">📊 Attendance: {studentInfo.attendance}%</Typography>
            <Typography variant="h6">💰 Fees Paid: {studentInfo.feesPaid ? "✅ Yes" : "❌ No"}</Typography>
          </>
        )}

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Typography variant="h6" gutterBottom>📚 Select Subjects:</Typography>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <FormControlLabel
                  key={subject._id} // ✅ Use unique ID
                  control={
                    <Checkbox
                      checked={selectedSubjects.some((s) => s._id === subject._id)}
                      onChange={() => handleSubjectChange(subject)}
                    />
                  }
                  label={`${subject.name} (${subject.code}) - ₹${subject.fees}`}
                />
              ))
            ) : (
              <Typography color="error">❌ No subjects available.</Typography>
            )}
          </FormGroup>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading}
            style={{ marginTop: 20 }}
          >
            {loading ? <CircularProgress size={24} /> : "📝 Register"}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default ExamRegistration;
