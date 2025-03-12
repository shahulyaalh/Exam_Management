import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState({ text: "", type: "" });
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [subjects, setSubjects] = useState([]); // ✅ Added subjects state
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchUploadedFiles();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await axios.get("http://localhost:5000/api/admin/students");
      setStudents(res.data);
    } catch (err) {
      console.error("❌ Error fetching students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchUploadedFiles = async () => {
    try {
      setLoadingFiles(true);
      const res = await axios.get("http://localhost:5000/api/files/uploads");
      setUploadedFiles(res.data);
    } catch (err) {
      console.error("❌ Error fetching files:", err);
    } finally {
      setLoadingFiles(false);
    }
  };


  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const res = await axios.get("http://localhost:5000/api/admin/subjects");
      setSubjects(res.data);
    } catch (err) {
      console.error("❌ Error fetching subjects:", err);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // ✅ Update Exam Schedule for a Subject
  const handleUpdateExamSchedule = async (subjectId, examSchedule) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/subjects/${subjectId}`, {
        examSchedule,
      });

      alert("✅ Exam schedule updated!");
      fetchSubjects(); // Refresh the subject list
    } catch (err) {
      console.error("❌ Error updating exam schedule:", err);
      alert("❌ Failed to update exam schedule.");
    }
  };


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadType) {
      setUploadMessage({ text: "⚠️ Please select a file and an upload type!", type: "error" });
      return;
    }

    setUploading(true);
    setUploadMessage({ text: "", type: "" });

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("uploadType", uploadType);

    try {
      const res = await axios.post("http://localhost:5000/api/files/upload", formData);
      setUploadMessage({ text: `✅ ${res.data.message}`, type: "success" });
      setSelectedFile(null);
      setUploadType("");
      fetchUploadedFiles();
      fetchStudents();
    } catch (err) {
      console.error("❌ File upload failed:", err);
      setUploadMessage({ text: "❌ Upload failed! Please try again.", type: "error" });
    } finally {
      setUploading(false);
    }
  };

  // ✅ Remove Student
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/students/${studentId}`);
      alert("✅ Student removed successfully!");
      setStudents((prevStudents) => prevStudents.filter((s) => s._id !== studentId));
    } catch (err) {
      console.error("❌ Error deleting student:", err);
      alert("❌ Failed to remove student.");
    }
  };

  // ✅ Update Student Attendance & Fees
  const handleUpdateStudent = async (studentId, updatedData) => {
    try {
      console.log(`📡 Sending Update Request for Student ID: ${studentId}`, updatedData);
  
      const res = await axios.patch(
        `http://localhost:5000/api/admin/students/${studentId}`,
        updatedData,
        { headers: { "Content-Type": "application/json" } } // ✅ Ensures correct format
      );
  
      alert("✅ Student updated successfully!");
      fetchStudents(); // Refresh student data
    } catch (err) {
      console.error("❌ Error updating student:", err.response?.data || err.message);
      alert("❌ Failed to update student.");
    }
  };
  
  return (
    <Paper style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* 🔹 File Upload Section */}
      <div style={{ marginBottom: 20 }}>
        <input type="file" onChange={handleFileChange} />
        <Select value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
          <MenuItem value="student_list">📋 Student List</MenuItem>
          <MenuItem value="arrear_list">❌ Arrear Student List</MenuItem>
          <MenuItem value="attendance">📊 Attendance & Fees</MenuItem>
          <MenuItem value="subjectname">📚 Subjects & Codes</MenuItem>
        </Select>
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload File"}
        </Button>
        {uploadMessage.text && (
          <Typography color={uploadMessage.type === "success" ? "green" : "red"}>
            {uploadMessage.text}
          </Typography>
        )}
      </div>

      {/* 🔹 Student List with Update Options */}
      <Typography variant="h5" style={{ marginTop: 20 }}>
        Registered Students
      </Typography>
      {loadingStudents ? (
        <CircularProgress />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Attendance (%)</strong></TableCell>
              <TableCell><strong>Fees Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student._id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>

                {/* 🔹 Editable Attendance Field */}
                <TableCell>
                  <TextField
                    type="number"
                    value={student.attendance}
                    onChange={(e) => {
                      const newAttendance = e.target.value;
                      setStudents((prevStudents) =>
                        prevStudents.map((s) =>
                          s._id === student._id ? { ...s, attendance: newAttendance } : s
                        )
                      );
                    }}
                  />
                </TableCell>

                {/* 🔹 Fees Status Dropdown */}
                <TableCell>
                  <Select
                    value={student.feesPaid ? "Paid" : "Pending"}
                    onChange={(e) =>
                      setStudents((prevStudents) =>
                        prevStudents.map((s) =>
                          s._id === student._id ? { ...s, feesPaid: e.target.value === "Paid" } : s
                        )
                      )
                    }
                  >
                    <MenuItem value="Paid">Paid</MenuItem>
                    <MenuItem value="Pending">Pending</MenuItem>
                  </Select>
                </TableCell>

                {/* 🔹 Update & Remove Buttons */}
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpdateStudent(student._id, { attendance: student.attendance, feesPaid: student.feesPaid })}
                  >
                    Update
                  </Button>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleDeleteStudent(student._id)}
                    style={{ marginLeft: "10px" }}
                  >
                    Remove
                  </Button>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
          <Button
      variant="contained"
      color="primary"
      style={{ marginTop: 20 }}
      onClick={() => window.location.href = "/exam-update"} // ✅ Redirect to ExamUpdate.js
    >
      ✏️ Update Exam Schedule
    </Button>
        </Table>
        
      )}
    </Paper>
    
    
  );
};

export default AdminDashboard;
