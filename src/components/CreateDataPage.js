import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BusinessIcon from "@mui/icons-material/Business";
import LayersIcon from "@mui/icons-material/Layers";
import PeopleIcon from "@mui/icons-material/People";
import "./CreateDataPage.css"; // Assuming you'll create this CSS file

const CreateDataPage = ({ onClose }) => {
  const [project, setProjectId] = useState("");
  const [image, setImage] = useState(null);
  const [totalFloors, setTotalFloors] = useState("");
  const [noOfEmployees, setNoOfEmployees] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [formVisible, setFormVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger the form animation after component mounts
    setTimeout(() => {
      setFormVisible(true);
    }, 100);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("project", project);
    formData.append("image", image);
    formData.append("total_floors", totalFloors);
    formData.append("no_of_employees", noOfEmployees);
    formData.append("description", description);

    try {
      const response = await fetch(
        "https://ff55-59-97-51-97.ngrok-free.app/building/create_project_list/",
        {
          method: "POST",
          body: formData,
        }
      );
      if (response.ok) {
        setMessage("Project created successfully!");
        setOpen(true);
        setTimeout(() => {
          setOpen(false);
          onClose && onClose();
          navigate("/");
        }, 3000);
      } else {
        setMessage("Failed to create project. Please try again.");
        setOpen(true);
      }
    } catch (error) {
      setMessage("An error occurred while creating the project.");
      setOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setOpen(false);
  };

  return (
    <Card
      className={`create-data-card ${formVisible ? 'form-visible' : ''}`}
      sx={{
        maxWidth: "600px",
        width: "100%",
        margin: "auto",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        transform: formVisible ? "translateX(0)" : "translateX(100%)",
        opacity: formVisible ? 1 : 0,
        transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
      }}
    >
      <CardContent sx={{ padding: "32px" }}>
        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          color="primary"
          marginBottom="20px"
          className="create-data-title"
        >
          Create Project
        </Typography>
        <Divider sx={{ marginBottom: "20px" }} />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} className="form-grid">
            <Grid item xs={12} className="form-field">
              <TextField
                label="Project Name"
                value={project}
                onChange={(e) => setProjectId(e.target.value)}
                fullWidth
                required
                className="form-input"
                InputProps={{
                  startAdornment: <BusinessIcon color="primary" sx={{ marginRight: "8px" }} />,
                }}
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <TextField
                label="Total Floors"
                value={totalFloors}
                onChange={(e) => setTotalFloors(e.target.value)}
                fullWidth
                required
                className="form-input"
                InputProps={{
                  startAdornment: <LayersIcon color="primary" sx={{ marginRight: "8px" }} />,
                }}
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} className="form-field">
              <TextField
                label="No. of Employees"
                value={noOfEmployees}
                onChange={(e) => setNoOfEmployees(e.target.value)}
                fullWidth
                required
                className="form-input"
                InputProps={{
                  startAdornment: <PeopleIcon color="primary" sx={{ marginRight: "8px" }} />,
                }}
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} className="form-field">
              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                fullWidth
                required
                multiline
                rows={4}
                className="form-input"
                sx={{
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} className="form-field">
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="upload-image"
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
              />
              <label htmlFor="upload-image">
                <Button
                  variant="contained"
                  component="span"
                  startIcon={<UploadFileIcon />}
                  sx={{ 
                    textTransform: "none",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s",
                    '&:hover': {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                    }
                  }}
                  className="upload-button"
                >
                  Upload Image
                </Button>
              </label>
              {image && (
                <Typography variant="body2" sx={{ marginTop: "8px", color: "#757575" }}>
                  {image.name}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button 
                type="submit" 
                variant="contained" 
                sx={{ 
                  fontWeight: "bold",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                  }
                }}
                className="submit-button"
              >
                Create Project
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={onClose}
                sx={{ 
                  fontWeight: "bold",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  '&:hover': {
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                  }
                }}
                className="cancel-button"
              >
                Close
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>

      <Snackbar open={open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={message.includes("success") ? "success" : "error"}>
          {message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default CreateDataPage;