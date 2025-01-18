import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

const CreatePlanDataPage = () => {
  const [planId, setPlanId] = useState("");
  const [image, setImage] = useState(null);
  const [floorOrName, setFloorOrName] = useState("");
  const [noOfEmployees, setNoOfEmployees] = useState("");
  const [description, setDescription] = useState("");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("plan_id", planId);
    formData.append("image", image);
    formData.append("floor_or_name", floorOrName);
    formData.append("no_of_employees", noOfEmployees);
    formData.append("description", description);

    try {
      const response = await fetch("http://59.97.51.97:8081/building/plan_details/", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        setMessage("Successfully submitted");
        setOpen(true);
        setTimeout(() => navigate("/"), 3000); // Redirect after 3 seconds
      } else {
        setMessage("Failed to submit");
        setOpen(true);
      }
    } catch (error) {
      setMessage("Error submitting data");
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1a237e, #283593)",
        minHeight: "100vh",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Card
        style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          background: "#212121",
        }}
      >
        <CardContent style={{ padding: "30px" }}>
          <Typography
            variant="h4"
            align="center"
            style={{
              marginBottom: "20px",
              color: "#ffcc80",
              fontWeight: "bold",
              textShadow: "0 2px 4px rgba(255, 204, 128, 0.8)",
            }}
          >
            Create Plan Details
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Plan ID"
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              style={{
                background: "#424242",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              InputLabelProps={{ style: { color: "#ffcc80" } }}
            />
            <TextField
              label="Floor or Name"
              value={floorOrName}
              onChange={(e) => setFloorOrName(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              style={{
                background: "#424242",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              InputLabelProps={{ style: { color: "#ffcc80" } }}
            />
            <TextField
              label="Number of Employees"
              value={noOfEmployees}
              onChange={(e) => setNoOfEmployees(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              style={{
                background: "#424242",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              InputLabelProps={{ style: { color: "#ffcc80" } }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
              required
              multiline
              rows={4}
              variant="outlined"
              style={{
                background: "#424242",
                borderRadius: "8px",
                color: "#ffffff",
              }}
              InputLabelProps={{ style: { color: "#ffcc80" } }}
            />
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
                style={{
                  margin: "10px 0",
                  padding: "10px 20px",
                  background: "linear-gradient(90deg, #ffcc80, #ffa726)",
                  borderRadius: "8px",
                  color: "#212121",
                  fontWeight: "bold",
                }}
              >
                Upload Image
              </Button>
            </label>
            <Button
              type="submit"
              variant="contained"
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                background: "linear-gradient(90deg, #64b5f6, #2196f3)",
                borderRadius: "8px",
                color: "#ffffff",
                fontWeight: "bold",
              }}
            >
              Submit
            </Button>
          </form>
          <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
            <MuiAlert
              elevation={6}
              variant="filled"
              onClose={handleClose}
              severity={message === "Successfully submitted" ? "success" : "error"}
            >
              {message}
            </MuiAlert>
          </Snackbar>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatePlanDataPage;
