import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Modal,
  CircularProgress,
} from "@mui/material";
import CreateDataPage from "./CreateDataPage";
import img from './img.jpg';


const ProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch("https://api.capture360.ai/building/projectlist/", {
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, []);

  const handleCreateProject = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  return (
    <Box
      sx={{
       
        
        padding: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop:"20px",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: "white",
            
          }}
        >
          Project List
        </Typography>
        <Button
  variant="contained"
  onClick={handleCreateProject}
  sx={{
    background: "linear-gradient(90deg, #ff7e5f, #feb47b)",
    color: "#fff",
    fontWeight: "600",
    padding: "6px 12px", // Further reduced padding
    minWidth: "100px", // Set a fixed minimum width
    width: "auto", // Ensures it doesn't expand unnecessarily
    borderRadius: "8px",
    textTransform: "none",
    transition: "0.3s ease-in-out",
    ":hover": {
      background: "linear-gradient(90deg, #feb47b, #ff7e5f)",
      transform: "scale(1.05)",
    },
  }}
>
          + Add Project
        </Button>
      </Box>

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress color="inherit" />
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 3,
            width: "100%",
            maxWidth: "1200px",
          }}
        >
          {projects.map((project) => (
            <Card
              key={project.id}
              sx={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(12px)",
                borderRadius: "16px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                transition: "transform 0.3s, box-shadow 0.3s",
                ":hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 15px 35px rgba(0, 0, 0, 0.4)",
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={img}
                alt={project.project}
                sx={{
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                  cursor: "pointer",
                  transition: "0.3s ease-in-out",
                  ":hover": { opacity: 0.9 },
                }}
                onClick={() =>
                  navigate("/image-view", {
                    state: { imageUrl: `https://api.capture360.ai/${img}`, name: project.project },
                  })
                }
              />
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: "bold",
                    color: "#ffffff",
                    marginBottom: 1,
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  {project.project}
                </Typography>
                <Typography variant="body2" sx={{ color: "black", marginBottom: "4px" }}>
                  <strong>Floors:</strong> {project.total_floors}
                </Typography>
                <Typography variant="body2" sx={{ color: "black" }}>
                  <strong>Employees:</strong> {project.no_of_employees}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal for Creating Project */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
            padding: 4,
          }}
        >
          <CreateDataPage onClose={handleModalClose} />
        </Box>
      </Modal>
    </Box>
  );
};

export default ProjectTable;
