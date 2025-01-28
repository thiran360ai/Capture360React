import React, { useState } from "react";
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

const CreateDataPage = ({ onClose }) => {
  const [project, setProjectId] = useState("");
  const [image, setImage] = useState(null);
  const [totalFloors, setTotalFloors] = useState("");
  const [noOfEmployees, setNoOfEmployees] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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
        "https://api.capture360.ai/building/create_project_list/",
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
          onClose();
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
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #001f3f, #0074d9)",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          maxWidth: "600px",
          width: "100%",
          borderRadius: "16px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          backdropFilter: "blur(10px)",
        }}
      >
        <CardContent sx={{ padding: "32px" }}>
          <Typography
            variant="h4"
            align="center"
            sx={{
              background: "linear-gradient(90deg, #001f3f, #0074d9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
              marginBottom: "24px",
            }}
          >
            Create Project
          </Typography>
          <Divider sx={{ backgroundColor: "#0074d9", marginBottom: "24px" }} />
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Project Name"
                  value={project}
                  onChange={(e) => setProjectId(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <BusinessIcon sx={{ color: "#0074d9", marginRight: "8px" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Total Floors"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <LayersIcon sx={{ color: "#0074d9", marginRight: "8px" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="No. of Employees"
                  value={noOfEmployees}
                  onChange={(e) => setNoOfEmployees(e.target.value)}
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <PeopleIcon sx={{ color: "#0074d9", marginRight: "8px" }} />
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "12px",
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
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
                      background: "linear-gradient(90deg, #001f3f, #0074d9)",
                      color: "#fff",
                      textTransform: "none",
                      borderRadius: "12px",
                    }}
                  >
                    Upload Image
                  </Button>
                </label>
                {image && (
                  <Typography
                    variant="body2"
                    sx={{ marginTop: "8px", color: "#757575" }}
                  >
                    {image.name}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  sx={{
                    background: "linear-gradient(90deg, #001f3f, #0074d9)",
                    color: "#fff",
                    padding: "12px",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    fontSize: "16px",
                    "&:hover": {
                      background: "linear-gradient(90deg, #0074d9, #001f3f)",
                    },
                  }}
                >
                  Create Project
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity={message.includes("success") ? "success" : "error"}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CreateDataPage;
