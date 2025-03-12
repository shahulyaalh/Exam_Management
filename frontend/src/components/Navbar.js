import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

const Navbar = () => {
  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: "flex", gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            Home
          </Button>
          {!isAuthenticated ? (
            <>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/student-dashboard">
                Student Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/hall-ticket">
                Hall Ticket
              </Button>
              <Button color="inherit" component={Link} to="/admin-dashboard">
                Admin Panel
              </Button>
              <Button color="inherit" component={Link} to="/exam-registration">
                Exam Registration
              </Button>
              <Button color="inherit" component={Link} to="/add-subject">
                Add Subject
              </Button>

              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
