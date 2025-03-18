import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  Modal,
  CircularProgress,
} from "@mui/material";
import CreateDataPage from "./CreateDataPage";
import img from './img.jpg';

// ImageLoader component for handling images from ngrok
const ImageLoader = ({ imageUrl, onClick = null, style = {} }) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        
        const response = await fetch(imageUrl, {
          headers: {
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            "ngrok-skip-browser-warning": "true",
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }
        
        const blob = await response.blob();
        setImageData(URL.createObjectURL(blob));
        setError(false);
      } catch (error) {
        console.error("Error fetching image:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    if (imageUrl) {
      fetchImage();
    } else {
      setError(true);
      setLoading(false);
    }
    
    // Cleanup function to revoke object URL
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData);
      }
    };
  }, [imageUrl]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '200px',
          ...style
        }}
      >
        <CircularProgress size={30} color="inherit" />
      </Box>
    );
  }

  if (error || !imageData) {
    return (
      <img 
        src={img} 
        alt="Default Project" 
        onClick={onClick}
        style={{
          objectFit: 'cover',
          width: '100%',
          height: '200px',
          ...style
        }}
      />
    );
  }

  return (
    <img 
      src={imageData} 
      alt="Project" 
      onClick={onClick}
      style={{
        objectFit: 'cover',
        width: '100%',
        height: '200px',
        ...style
      }}
    />
  );
};

const ProjectTable = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Get token from localStorage if you're using authentication
        const token = localStorage.getItem("token");

        // Fetch projects data with proper headers
        const response = await fetch("https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/building/projectlist/", {
          method: "GET",
          mode: "cors",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            "ngrok-skip-browser-warning": "true",
          },
        });

        // Handle authentication errors
        if (response.status === 401) {
          console.error("Unauthorized! Token may be expired.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        // Check if response is OK
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response
        const data = await response.json();
        console.log("Projects data:", data);
        
        // Update state with fetched projects
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [navigate]);

  const handleCreateProject = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleImageClick = (project) => {
    navigate("/image-view", {
      state: { 
        imageUrl: project.image ? 
          `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/${project.image}` : 
          null, 
        name: project.project 
      },
    });
  };

  return (
    <Box
      sx={{
        padding: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        marginTop: "20px",
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
            padding: "6px 12px",
            minWidth: "100px",
            width: "auto",
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
      ) : projects.length > 0 ? (
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
              key={project.id || project.project_id || project.project}
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
                overflow: "hidden",
              }}
            >
              <Box 
                sx={{ 
                  height: "200px", 
                  borderTopLeftRadius: "16px",
                  borderTopRightRadius: "16px",
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <ImageLoader 
                  imageUrl={project.image ? `https://9a7e-2409-40f4-201c-1293-8db2-f79e-87d0-63ff.ngrok-free.app/${project.image}` : null}
                  onClick={() => handleImageClick(project)}
                  style={{
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                    transition: "0.3s ease-in-out",
                    ":hover": { opacity: 0.9 },
                  }}
                />
              </Box>
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
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <Typography variant="h6" sx={{ color: "white" }}>
            No projects available
          </Typography>
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