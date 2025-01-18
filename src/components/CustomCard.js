import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import "./CustomCard.css"; // Import the external CSS file

const CustomCard = ({ title, count }) => {
  return (
    <div>
      <Card className="custom-card">
        <CardContent>
          <Box className="card-content">
            <Typography variant="h5">{title}</Typography>
            <Typography variant="h6">{count}</Typography>
          </Box>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomCard;