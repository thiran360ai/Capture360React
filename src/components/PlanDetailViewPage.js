import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

const PlanDetailViewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, data } = location.state || {};

  const renderImage = (imageUrl, name) => {
    const fullImageUrl = `https://api.capture360.ai/${imageUrl}`;
    return (
      <div key={name}>
        <img
          src={fullImageUrl}
          alt={name}
          style={{ width: "300px", height: "auto", cursor: "pointer" }}
          onClick={() => navigate("/image-view", { state: { imageUrl: fullImageUrl, name } })}
        />
      </div>
    );
  };

  const renderData = (data) => {
    return Object.entries(data).map(([key, value]) => {
      if (typeof value === "string" && value.includes("/media/")) {
        return renderImage(value, key);
      } else {
        return (
          <Typography variant="body1" key={key}>
            {key}: {value}
          </Typography>
        );
      }
    });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      {data ? (
        <div>{renderData(data)}</div>
      ) : (
        <Typography>No details available for this plan.</Typography>
      )}
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/plan-details")}
      >
        Back to Plan Details
      </Button>
    </div>
  );
};

export default PlanDetailViewPage;
