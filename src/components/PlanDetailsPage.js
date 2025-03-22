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

const ImageLoader = ({ imageUrl, alt = "Image" }) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const API_BASE_URL = "https://ff55-59-97-51-97.ngrok-free.app";

  useEffect(() => {
    const loadImage = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        // Check if the imageUrl already starts with http or https
        const fullImageUrl = imageUrl.startsWith('http') 
          ? imageUrl 
          : `${API_BASE_URL}${imageUrl}`;
        
        const response = await fetch(fullImageUrl, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "ngrok-skip-browser-warning": "true",
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setImageData(objectUrl);
        setLoading(false);
      } catch (err) {
        console.error("Error loading image:", err);
        setError(true);
        setLoading(false);
      }
    };

    if (imageUrl) {
      loadImage();
    }

    // Clean up function to revoke object URL
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageUrl]);

  if (loading) {
    return (
      <Box sx={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress size={30} thickness={3} style={{ color: "#00509e" }} />
      </Box>
    );
  }

  if (error || !imageData) {
    return (
      <Box sx={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: '8px' }}>
        <Typography variant="caption" color="textSecondary">Image unavailable</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ position: 'relative', width: '100px', height: '100px' }}>
      <img
        src={imageData}
        alt={alt}
        style={{
          width: "100px",
          height: "100px",
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
    </Box>
  );
};

const PlanDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get data from location state
  const { title, projectId, apiEndpoint } = location.state || { 
    title: "Plan Details", 
    projectId: null 
  };
  
  // Define base URL once for consistency
  const API_BASE_URL = "https://ff55-59-97-51-97.ngrok-free.app";

  useEffect(() => {
    fetchPlanDetails();
  }, [projectId]); // Add projectId as dependency

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Use the provided apiEndpoint or build one with the projectId
      const endpoint = apiEndpoint || `${API_BASE_URL}/building/plan_details/`;
      const url = projectId ? `${endpoint}?project=${projectId}` : endpoint;
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          "ngrok-skip-browser-warning": "true",
        },
      });
      
      if (response.status === 401) {
        console.error("Unauthorized! Token may be expired.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched plan data:", data);
      setPlanData(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching plan details:", err);
      setError("Failed to load plan details. Please try again later.");
      setLoading(false);
    }
  };

  const handleViewPlan = (id) => {
    navigate("/image-gallery", { 
      state: { 
        id,
        projectId
      }
    });
  };

  const renderCellContent = (key, value) => {
    // Check if the value is a string that likely points to an image
    if (
      typeof value === "string" && 
      (value.includes("/media/") || value.includes("/static/"))
    ) {
      return <ImageLoader imageUrl={value} alt={`Plan ${key}`} />;
    }
    
    // Otherwise, just display the value
    return value;
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
                        {renderCellContent(key, value)}
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