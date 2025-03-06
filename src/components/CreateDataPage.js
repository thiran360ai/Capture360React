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
    <Card
      sx={{
        maxWidth: "600px",
        width: "100%",
        margin: "auto",
        borderRadius: "12px",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <CardContent sx={{ padding: "32px" }}>
        <Typography
          variant="h5"
          align="center"
          fontWeight="bold"
          color="primary"
          marginBottom="20px"
        >
          Create Project
        </Typography>
        <Divider sx={{ marginBottom: "20px" }} />
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Project Name"
                value={project}
                onChange={(e) => setProjectId(e.target.value)}
                fullWidth
                required
                InputProps={{
                  startAdornment: <BusinessIcon color="primary" sx={{ marginRight: "8px" }} />,
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
                  startAdornment: <LayersIcon color="primary" sx={{ marginRight: "8px" }} />,
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
                  startAdornment: <PeopleIcon color="primary" sx={{ marginRight: "8px" }} />,
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
                  sx={{ textTransform: "none" }}
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
              <Button type="submit" variant="contained" sx={{ fontWeight: "bold" }}>
                Create Project
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={onClose}
                sx={{ fontWeight: "bold" }}
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
