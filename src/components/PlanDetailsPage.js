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

// 🔹 Mock Static Data
const mockData = [
  {
    id: 1,
    name: "Plan A",
    floor: "1st Floor",
    image: "/media/sample1.jpg",
    description: "Main lobby area"
  },
  {
    id: 2,
    name: "Plan B",
    floor: "2nd Floor",
    image: "/media/sample2.jpg",
    description: "Office layout"
  },
  {
    id: 3,
    name: "Plan C",
    floor: "3rd Floor",
    image: "/media/sample3.jpg",
    description: "Conference rooms"
  }
];

// Styled Components
const StyledTableContainer = styled(Box)({
  width: "100%",
  overflowX: "auto",
  maxHeight: "calc(100vh - 150px)"
});

const StyledTable = styled(Table)({
  minWidth: "800px",
  borderCollapse: "collapse"
});

const HeaderCell = styled(TableCell)({
  fontWeight: "bold",
  fontSize: "16px",
  color: "#ffffff",
  backgroundColor: "#00509e",
  position: "sticky",
  top: 0,
  zIndex: 2
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
    backgroundColor: "#003f7d"
  }
});

const PlanDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [planData, setPlanData] = useState([]);
  const [pageTitle, setPageTitle] = useState("Plan Details for Project");

  useEffect(() => {
    // Extract data from location state or use mock data as fallback
    if (location.state && location.state.data && location.state.data.length > 0) {
      setPlanData(location.state.data);
    } else {
      // Use mock data as fallback
      setPlanData(mockData);
    }
    
    // Set title if available
    if (location.state && location.state.title) {
      setPageTitle(location.state.title);
    }
  }, [location.state]);

  const handleViewPlan = (id) => {
    navigate("/image-gallery", { state: { id } });
  };

  const renderImage = (imageUrl) => {
    try {
      // Handle different URL formats
      const fullImageUrl = imageUrl.startsWith("http")
        ? imageUrl
        : `https://api.capture360.ai/${imageUrl.replace(/^\//, "")}`;

      return (
        <img
          src={fullImageUrl}
          alt="Plan"
          style={{
            width: "100px",
            height: "auto",
            borderRadius: "8px",
            objectFit: "cover"
          }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/100x60?text=No+Image";
          }}
        />
      );
    } catch (error) {
      console.error("Error rendering image:", error);
      return <span>Image unavailable</span>;
    }
  };

  // Dynamically determine headers based on available data
  const getTableHeaders = () => {
    if (planData.length === 0) return [];
    return Object.keys(planData[0]);
  };

  return (
    <Box style={{ backgroundColor: "#f4f7fa", minHeight: "100vh", padding: "16px" }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        style={{
          color: "#2e3b4e",
          fontWeight: "700",
          marginBottom: "16px"
        }}
      >
        {pageTitle}
      </Typography>

      {planData && planData.length > 0 ? (
        <Paper elevation={3} style={{ padding: "16px", maxWidth: "100%" }}>
          <StyledTableContainer>
            <StyledTable stickyHeader>
              <TableHead>
                <TableRow>
                  {getTableHeaders().map((header, index) => (
                    <HeaderCell key={index}>
                      {header.charAt(0).toUpperCase() + header.slice(1)}
                    </HeaderCell>
                  ))}
                  <HeaderCell>Action</HeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.entries(row).map(([key, value], cellIndex) => (
                      <TableCell
                        key={`${rowIndex}-${cellIndex}`}
                        style={{
                          fontSize: "14px",
                          color: "#333",
                          padding: "12px"
                        }}
                      >
                        {key === "image" || (typeof value === "string" && value.includes("/media/"))
                          ? renderImage(value)
                          : value}
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <ActionButton onClick={() => handleViewPlan(row.id)}>
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
          Loading data... If nothing appears, no plan details are available.
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
            fontWeight: "bold"
          }}
        >
          Back to Project List
        </Button>
      </Box>
    </Box>
  );
};

export default PlanDetailsPage;