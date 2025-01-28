import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Correct import for Bootstrap CSS
import { Card, CardContent, Snackbar, TextField, Typography } from '@mui/material';
import Button from "@mui/material/Button";
import MuiAlert from "@mui/material/Alert";
import { useNavigate } from 'react-router-dom';


const RegisterForm = ({onClose}) => {
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'admin',
    location: '',
    is_active: true
  });
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false); 
  const [loading,setLoading] = useState(false);

  const handleCloseSnackbar = () =>{ 
  setOpen(false);
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Submitting form data:', formData);
    setLoading(true)
    try {
      const response = await fetch('https://api.capture360.ai/building/create_user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': '98547'
        },
        body: JSON.stringify({
          ...formData,
          role: formData.role
        })
      });

      if (!response.ok) { 
        setLoading(false)
        const errorData = await response.json();
        console.error('Error response:', errorData);
        setMessage("Failed to submit");
        setOpen(true)
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Registration successful:', data);
      setMessage("Successfully submitted");
      setOpen(true);
      setLoading(false)
      setTimeout(() => {
        setOpen(false);
        onClose();
       setLoading(false)
        navigate("/create-manager"); // Redirect after 3 seconds
      }, 3000);
      // Handle successful registration (e.g., show success message, redirect, etc.)
    } catch (error) {
      setMessage("Error during registration");
      setOpen(true)
      setLoading(false)
      console.error('Error during registration:', error);
      // Handle error (e.g., show error message to user)
    }
  };
 
  return ( 
<Card style={{ maxWidth: 1000, margin: "auto", marginTop: 30, height: "100vh" }}>
  <CardContent 
    style={{ 
      width: '450px', 
      boxShadow: "0 8px 16px rgba(0,0,0,0.2)", 
      backgroundColor: '#efebe9', 
      borderRadius: 8, 
      overflowY: "auto", 
      maxHeight: "calc(100vh - 60px)" // Adjust height to fit within the card
    }}
  >
    <Typography variant="h6" gutterBottom style={{ marginBottom: 30, textAlign: "center", fontSize: '28px' }}>
      <span style={{ textDecoration: 'underline', color: 'GrayText' }}>Create New User</span>
    </Typography>
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <TextField
        name='id'
        label="ID"
        value={formData.id}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <TextField
        name='username'
        label="Username"
        value={formData.username}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <TextField
        name='first_name'
        label="First Name"
        value={formData.first_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <TextField
        name='last_name'
        label="Last Name"
        value={formData.last_name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <TextField
        name='email'
        label="Email"
        value={formData.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <TextField
        name='password'
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <TextField
        name='location'
        label="Location"
        value={formData.location}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        style={{ backgroundColor: "#ffffff", borderRadius: 4 }}
        size="small"
      />
      <Button 
      disabled={loading || message === "Successfully submitted"}
        type="submit"
        variant="contained"
        color="primary"
        style={{ color: "#ffffff", margin: "10px 0", borderRadius: 4 }}
        size="small"
      >
        Register
      </Button>
    </form>
  </CardContent>
  <Snackbar open={open} autoHideDuration={3000} onClose={handleCloseSnackbar} style={{ bottom: 50 }}>
    <MuiAlert elevation={6} variant="filled"  severity={message === "Successfully submitted" ? "success" : "error"}>
      {message}
    </MuiAlert>
  </Snackbar>
</Card>

 )

};

export default RegisterForm;
