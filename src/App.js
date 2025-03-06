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

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  const [liveProjects, setLiveProjects] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [liveEmployees, setLiveEmployees] = useState(0);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(
          "https://api.capture360.ai/building/projectlist/",
          { headers: { Accept: "application/json" } }
        );
        const data = await response.json();
        setTotalProjects(data.length);
        setLiveProjects(data.length);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await fetch(
          "https://api.capture360.ai/building/create_user/",
          { headers: { Accept: "application/json" } }
        );
        const data = await response.json();
        setTotalEmployees(data.length);
        setLiveEmployees(data.length);
      } catch (error) {
        console.error("Failed to fetch User data:", error);
      }
    };

    fetchProjectData();
    fetchEmployeeData();
  }, []);

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
                          <Grid item xs={12} sm={6} md={3} key={index} sx={{ px: 0,py:0}}>
                            <Card
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 0.5, // Reduced padding
                                boxShadow: 2, // Softer shadow
                                borderRadius: 2, // Slightly reduced border radius
                                bgcolor: "#f8f9fa",
                                minHeight: 150, // Reduced height
                                maxWidth: 280, // **Reduced width**
                                mx: "auto", // Centers the card within the Grid item
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
                                  {card.count}
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
