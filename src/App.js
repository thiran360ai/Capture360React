import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { Work, PlayCircleFilled, People, Person } from "@mui/icons-material";
import Sidebar from "./components/Sidebar";
import CustomCard from "./components/CustomCard";
import LoginPage from "./components/LoginPage";
import DataPage from "./components/DataPage";
import PlanDetailsPage from "./components/PlanDetailsPage";
import PlanDetailViewPage from "./components/PlanDetailViewPage";
import CreateDataPage from "./components/CreateDataPage";
import ImageGalleryComponent from "./components/ImageGalleryComponent";
import ImageViewPage from "./components/ImageViewPage";
import CreatePlanDataPage from "./components/CreatePlanDataPage";
import VidPage from "./components/VidPage";
import ProjectTable from "./components/ProjectTable";
import RegisterForm from "./components/RegisterForm";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import "./App.css";

const theme = createTheme({
  palette: {
    mode: "light",
  },
});

// Base card style
const baseCardStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  p: 0.5,
  boxShadow: 2,
  borderRadius: 2,
  bgcolor: "#f8f9fa",
  minHeight: 150,
  maxWidth: 280,
  mx: "auto",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: 6,
    cursor: "pointer",
  }
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  const [liveProjects, setLiveProjects] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [liveEmployees, setLiveEmployees] = useState(0);
  const [cardsVisible, setCardsVisible] = useState([false, false, false, false]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use Promise.all to fetch data in parallel
        const [projectResponse, employeeResponse] = await Promise.all([
          fetch("https://ff55-59-97-51-97.ngrok-free.app/building/projectlist/", {
            method: "GET",
            headers: { 
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          }),
          fetch("https://ff55-59-97-51-97.ngrok-free.app/building/create_user/", {
            method: "GET",
            headers: { 
              "Accept": "application/json",
              "Content-Type": "application/json"
            }
          })
        ]);

        // Check if responses are successful
        if (!projectResponse.ok) {
          throw new Error(`Project API error: ${projectResponse.status}`);
        }
        if (!employeeResponse.ok) {
          throw new Error(`Employee API error: ${employeeResponse.status}`);
        }

        // Parse JSON responses
        const projectData = await projectResponse.json();
        const employeeData = await employeeResponse.json();

        // Calculate project stats
        if (Array.isArray(projectData)) {
          setTotalProjects(projectData.length);
          // Assuming projects with status 'active' or similar are live
          const activeProjCount = projectData.filter(project => 
            project.status === 'active' || project.status === 'live'
          ).length;
          setLiveProjects(activeProjCount || projectData.length); // Default to all if no status field
        }

        // Calculate employee stats
        if (Array.isArray(employeeData)) {
          setTotalEmployees(employeeData.length);
          // Assuming employees with status 'active' or similar are live
          const activeEmpCount = employeeData.filter(employee => 
            employee.status === 'active' || employee.is_active === true
          ).length;
          setLiveEmployees(activeEmpCount || employeeData.length); // Default to all if no status field
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // Set fallback values or keep previous values
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch data if logged in
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  // Animation effect for cards
  useEffect(() => {
    if (isLoggedIn && !isLoading) {
      // Trigger animations with a delay for each card
      const timeouts = [];
      for (let i = 0; i < 4; i++) {
        const timeout = setTimeout(() => {
          setCardsVisible(prev => {
            const newState = [...prev];
            newState[i] = true;
            return newState;
          });
        }, 200 * i); // 200ms delay between each card
        timeouts.push(timeout);
      }

      // Cleanup function
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
  }, [isLoggedIn, isLoading]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        className={`App main-container ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {isLoggedIn ? (
          <>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="content">
              <div className="top-bar">
                <div className="right-side">
                  <input
                    type="text"
                    className="search-bar"
                    placeholder="Search..."
                  />
                  <div className="profile">Profile</div>
                </div>
              </div>
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <Grid container spacing={0.5} sx={{ mt: 2, px: 0 }}>
                        {[
                          {
                            title: "Total Project",
                            count: totalProjects,
                            icon: <Work fontSize="medium" />,
                          },
                          {
                            title: "Live Project",
                            count: liveProjects,
                            icon: <PlayCircleFilled fontSize="medium" />,
                          },
                          {
                            title: "Total User",
                            count: totalEmployees,
                            icon: <People fontSize="medium" />,
                          },
                          {
                            title: "Live User",
                            count: liveEmployees,
                            icon: <Person fontSize="medium" />,
                          },
                        ].map((card, index) => (
                          <Grid item xs={12} sm={6} md={3} key={index} sx={{ px: 0, py: 0 }}>
                            <Card
                              sx={{
                                ...baseCardStyle,
                                transform: cardsVisible[index] ? "translateX(0)" : "translateX(100%)",
                                opacity: cardsVisible[index] ? 1 : 0,
                                transition: "transform 0.5s ease-out, opacity 0.5s ease-out, box-shadow 0.3s ease",
                              }}
                            >
                              {card.icon}
                              <CardContent
                                sx={{ textAlign: "center", padding: "8px" }}
                              >
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {card.title}
                                </Typography>
                                <Typography variant="h5" color="primary">
                                  {isLoading ? "..." : card.count}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      <ProjectTable />
                    </>
                  }
                />
                <Route path="/data" element={<DataPage />} />
                <Route path="/plan-details" element={<PlanDetailsPage />} />
                <Route
                  path="/plan-detail-view"
                  element={<PlanDetailViewPage />}
                />
                <Route path="/create" element={<CreateDataPage />} />
                <Route path="/project-manager" element={<DataPage />} />
                <Route
                  path="/create-manager"
                  element={<DataPage createUser={true} />}
                />
                <Route
                  path="/image-gallery"
                  element={<ImageGalleryComponent />}
                />
                <Route path="/image-view" element={<ImageViewPage />} />
                <Route path="/create-plan" element={<CreatePlanDataPage />} />
                <Route path="/vid" element={<VidPage />} />
                <Route path="/register" element={<RegisterForm />} />
              </Routes>
            </div>
          </>
        ) : (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        )}
      </div>
    </ThemeProvider>
  );
};

export default App;