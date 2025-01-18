import React from "react";
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

const PlanDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, data } = location.state || {};
  console.log("data", data)

  const handleViewPlan = (id) => {
    navigate("/image-gallery", { state: { id } });
  };

  const renderImage = (imageUrl) => {
    const fullImageUrl = `http://59.97.51.97:8081/${imageUrl}`;
    return (
      <img
        src={fullImageUrl}
        alt="Plan"
        style={{
          width: "100px",
          height: "auto",
          borderRadius: "8px",
          objectFit: "cover",
        }}
      />
    );
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
          marginBottom: "16px",
        }}
      >
        {title || "Plan Details for Project 1"}
      </Typography>

      {data ? (
        <Paper elevation={3} style={{ padding: "16px", maxWidth: "100%" }}>
          <StyledTableContainer>
            <StyledTable stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(data[0]).map((key, index) => (
                    <HeaderCell key={index}>{key}</HeaderCell>
                  ))}
                  <HeaderCell>Action</HeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row, index) => (
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
                        {typeof value === "string" && value.includes("/media/")
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
