import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Button,
  Drawer,
  Box,
  Card,
  CardContent,
  CircularProgress
} from "@mui/material";
import CreateDataPage from "./CreateDataPage";
import RegisterForm from "./RegisterForm";
import "./DataPage.css";
import img from './img.jpg'; // Default image import

// ImageLoader component for handling images from API
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
          width: '100px',
          height: '100px',
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
        alt="Default" 
        onClick={onClick}
        style={{
          width: '100px',
          height: 'auto',
          cursor: 'pointer',
          borderRadius: '8px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          ...style
        }}
      />
    );
  }

  return (
    <img 
      src={imageData} 
      alt="Item" 
      onClick={onClick}
      style={{
        width: '100px',
        height: 'auto',
        cursor: 'pointer',
        borderRadius: '8px',
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
        ...style
      }}
    />
  );
};

const DataPage = ({ createUser = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { title, apiEndpoint } = location.state || {};
  const [fetchedData, setFetchedData] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Define base URL once for consistency
  const API_BASE_URL = "https://ff55-59-97-51-97.ngrok-free.app";

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = apiEndpoint || `${API_BASE_URL}/building/projectlist/`;
      
      const response = await fetch(endpoint, {
        method: "GET",
        mode: "cors",
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const jsonData = await response.json();
      console.log("Fetched data:", jsonData);
      setFetchedData(Array.isArray(jsonData) ? jsonData : []);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setError("Failed to load data. Please try again later.");
      setFetchedData([]); // Ensure UI doesn't break on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [apiEndpoint]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleView = async (row) => {
    if (!row.project) {
      console.error("Project ID is missing:", row);
      return;
    }

    navigate("/plan-details", {
      state: { 
        title: `Plan Details for Project ${row.project}`,
        projectId: row.project,
        apiEndpoint: `${API_BASE_URL}/building/plan_details/`
      },
    });
  };

  const handleImageClick = (imageUrl, name) => {
    navigate("/image-view", {
      state: { 
        imageUrl: imageUrl, 
        name: name 
      },
    });
  };

  const openCreateDrawer = () => {
    setIsCreateDrawerOpen(true);
  };

  const closeCreateDrawer = () => {
    setIsCreateDrawerOpen(false);
    // Refresh data after closing the drawer
    setLoading(true);
    fetchData();
  };

  return (
    <Card
      sx={{
        width: "1100px",
        height: "650px",
        boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
        marginTop: "20px",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
        overflow: "auto",
        transition: "all 0.3s ease",
        marginLeft: "150px",
      }}
    >
      <CardContent>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: "#004e92",
            fontWeight: "600",
            paddingLeft: "20px",
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          {title || "Data Page"}
        </Typography>
        <Box
          className="button-container"
          sx={{
            marginLeft: "80%",
            justifyContent: "flex-end",
            marginBottom: "20px",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={openCreateDrawer}
            sx={{
              color: "#ffffff",
              margin: "10px 0",
              borderRadius: 6,
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#00509e",
              },
              "&:not(:hover)": {
                backgroundColor: "#006bb3",
              },
            }}
          >
            {createUser ? "Create User" : "Add Project"}
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
            <CircularProgress color="primary" />
          </Box>
        ) : error ? (
          <Typography variant="body1" color="error" sx={{ textAlign: "center", marginTop: 4 }}>
            {error}
          </Typography>
        ) : fetchedData && fetchedData.length > 0 ? (
          <Table sx={{ width: "100%" }}>
            <TableHead sx={{ backgroundColor: "#f0f0f0" }}>
              <TableRow>
                {Object.keys(fetchedData[0] || {}).map((key, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#004e92",
                      textTransform: "capitalize",
                    }}
                  >
                    {key}
                  </TableCell>
                ))}
                <TableCell
                  sx={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#004e92",
                    textAlign: "center",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fetchedData.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#ffffff",
                    transition: "background-color 0.3s ease",
                    "&:hover": {
                      backgroundColor: "#f0f0f0",
                    },
                  }}
                >
                  {Object.entries(row).map(([key, value], idx) => (
                    <TableCell
                      key={idx}
                      sx={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#333333",
                        padding: "12px",
                      }}
                    >
                      {key === "image" ? (
                        <ImageLoader 
                          imageUrl={`${API_BASE_URL}/${value}`}
                          onClick={() => handleImageClick(`${API_BASE_URL}/${value}`, row.name || row.project)}
                        />
                      ) : value}
                    </TableCell>
                  ))}
                  <TableCell sx={{ textAlign: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleView(row)}
                      sx={{
                        width: "180px",
                        color: "#ffffff",
                        margin: "10px 0",
                        borderRadius: 6,
                        textTransform: "none",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#00509e",
                        },
                        "&:not(:hover)": {
                          backgroundColor: "#006bb3",
                        },
                      }}
                    >
                      View Floor Data
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body1" sx={{ textAlign: "center", marginTop: 4 }}>
            No data available
          </Typography>
        )}

        <Drawer anchor="right" open={isCreateDrawerOpen} onClose={closeCreateDrawer}>
          <Box sx={{ width: 500, padding: 3 }}>
            {!createUser ? <CreateDataPage onClose={closeCreateDrawer} /> : <RegisterForm onClose={closeCreateDrawer} />}
          </Box>
        </Drawer>
      </CardContent>
    </Card>
  );
};

export default DataPage;