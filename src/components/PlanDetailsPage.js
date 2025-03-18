import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { styled } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";

// Styled Components
const StyledTableContainer = styled(Box)({
  width: "100%",
  overflowX: "auto",
  maxHeight: "calc(100vh - 150px)", // Dynamic height adjustment
});

const StyledTable = styled(Table)({
  minWidth: "800px",
  borderCollapse: "collapse",
});

const HeaderCell = styled(TableCell)({
  fontWeight: "bold",
  fontSize: "16px",
  color: "#ffffff",
  backgroundColor: "#00509e",
  position: "sticky",
  top: 0,
  zIndex: 2,
});

const ActionButton = styled(Button)({
  textTransform: "none",
  backgroundColor: "#00509e",
  color: "#ffffff",
  fontWeight: "600",
  padding: "8px 16px",
  borderRadius: "20px",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "#003f7d",
  },
});

const LoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "300px",
});

const PlanDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { title } = location.state || { title: "Plan Details" };
  
  const API_BASE_URL = "https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app";

  useEffect(() => {
    fetchPlanDetails();
  }, []);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/building/plan_details/`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setPlanData(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching plan details:", err);
      setError("Failed to load plan details. Please try again later.");
      setLoading(false);
    }
  };

  const handleViewPlan = (id) => {
    navigate("/image-gallery", { state: { id } });
  };

  const renderImage = (imageUrl) => {
    // Check if the imageUrl already starts with http or https
    const fullImageUrl = imageUrl.startsWith('http') 
      ? imageUrl 
      : `${API_BASE_URL}${imageUrl}`;
      
    return (
      <Box sx={{ position: 'relative', width: '100px', height: '100px' }}>
        <img
          src={fullImageUrl}
          alt="Plan"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "8px",
            objectFit: "cover",
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/placeholder-image.png"; // Replace with your placeholder image
            e.target.style.opacity = "0.5";
          }}
        />
      </Box>
    );
  };

  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress size={60} thickness={4} style={{ color: "#00509e" }} />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Box style={{ padding: "32px", textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="contained" 
          onClick={fetchPlanDetails}
          style={{ marginTop: "16px" }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box style={{ backgroundColor: "#f4f7fa", minHeight: "100vh", padding: "16px" }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        style={{
          color: "#2e3b4e",
          fontWeight: "700",
          marginBottom: "16px",
        }}
      >
        {title || "Plan Details for Project"}
      </Typography>

      {planData && planData.length > 0 ? (
        <Paper elevation={3} style={{ padding: "16px", maxWidth: "100%" }}>
          <StyledTableContainer>
            <StyledTable stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(planData[0]).map((key, index) => (
                    <HeaderCell key={index}>{key}</HeaderCell>
                  ))}
                  <HeaderCell>Action</HeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planData.map((row, index) => (
                  <TableRow key={index}>
                    {Object.entries(row).map(([key, value], idx) => (
                      <TableCell
                        key={idx}
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          padding: "12px",
                        }}
                      >
                        {typeof value === "string" && 
                         (value.includes("/media/") || value.includes("/static/")) 
                          ? renderImage(value)
                          : value}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <ActionButton onClick={() => handleViewPlan(row.id || index)}>
                        View 360°
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </StyledTable>
          </StyledTableContainer>
        </Paper>
      ) : (
        <Typography
          variant="h6"
          align="center"
          style={{ color: "#555", marginTop: "30px" }}
        >
          No plan details available.
        </Typography>
      )}

      <Box mt={4} display="flex" justifyContent="center">
        <Button
          variant="contained"
          onClick={() => navigate("/")}
          style={{
            backgroundColor: "#00509e",
            color: "#ffffff",
            textTransform: "none",
            padding: "12px 24px",
            borderRadius: "20px",
            fontWeight: "bold",
          }}
        >
          Back to Project List
        </Button>
      </Box>
    </Box>
  );
};

export default PlanDetailsPage;