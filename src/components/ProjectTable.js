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
} from "@mui/material";
import CreateDataPage from "./CreateDataPage";

const ProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(
          "http://59.97.51.97:8081/building/projectlist/",
          {
            headers: {
              Accept: "application/json",
              
            },
          }
        );
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      }
    };

    fetchProjectData();
  }, []);

  const handleCreateProject = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
        padding: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
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
            color: "#ffffff",
            textShadow: "0 4px 6px rgba(0, 0, 0, 0.5)",
          }}
        >
          Project List
        </Typography>
        <Button
          variant="contained"
          onClick={handleCreateProject}
          sx={{
            background: "linear-gradient(90deg, #6a11cb, #2575fc)",
            color: "#fff",
            fontWeight: "600",
            padding: "10px 20px",
            borderRadius: "8px",
            ":hover": {
              background: "linear-gradient(90deg, #2575fc, #6a11cb)",
            },
          }}
        >
          + Add Project
        </Button>
      </Box>

      {/* Project Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 3,
        }}
      >
        {projects.map((project) => (
          <Card
            key={project.id}
            sx={{
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)",
              transition: "transform 0.3s, box-shadow 0.3s",
              ":hover": {
                transform: "scale(1.05)",
                boxShadow: "0 15px 30px rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            <CardMedia
              component="img"
              height="180"
              image={`http://59.97.51.97:8081/${project.image}`}
              alt={project.project}
              sx={{
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                cursor: "pointer",
              }}
              onClick={() =>
                navigate("/image-view", {
                  state: {
                    imageUrl: `http://59.97.51.97:8081/${project.image}`,
                    name: project.project,
                  },
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
              <Typography
                variant="body2"
                sx={{ color: "#dcdde1", marginBottom: "4px" }}
              >
                <strong>Floors:</strong> {project.total_floors}
              </Typography>
              <Typography variant="body2" sx={{ color: "#dcdde1" }}>
                <strong>Employees:</strong> {project.no_of_employees}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Modal for Creating Project */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
            background: "rgba(255, 255, 255, 0.9)",
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
