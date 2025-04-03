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

// Define keyframes for the animation in your CSS
const slideInAnimationCSS = `
@keyframes slideInFromRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulseEffect {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.slide-in-card {
  animation: slideInFromRight 0.8s ease-out forwards;
  transition: all 0.3s ease;
}

.slide-in-card:hover {
  transform: translateY(-5px);
}

.slide-in-card:nth-child(1) {
  animation-delay: 0.1s;
}

.slide-in-card:nth-child(2) {
  animation-delay: 0.3s;
}

.slide-in-card:nth-child(3) {
  animation-delay: 0.5s;
}

.slide-in-card:nth-child(4) {
  animation-delay: 0.7s;
}

.card-icon {
  transition: transform 0.3s ease;
}

.slide-in-card:hover .card-icon {
  transform: scale(1.2);
}

.card-title {
  transition: color 0.3s ease;
}

.slide-in-card:hover .card-title {
  color: #006bb3;
}

.card-count {
  transition: transform 0.3s ease;
}

.slide-in-card:hover .card-count {
  transform: scale(1.1);
}
`;

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#006bb3",
    },
  },
});

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [totalProjects, setTotalProjects] = useState(0);
  const [liveProjects, setLiveProjects] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [liveEmployees, setLiveEmployees] = useState(0);
  const [animationLoaded, setAnimationLoaded] = useState(false);

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    // Add a slight delay before starting animations
    setTimeout(() => {
      setAnimationLoaded(true);
    }, 300);
  };

  useEffect(() => {
    // Add animation styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = slideInAnimationCSS;
    document.head.appendChild(styleElement);

    // Clean up function to remove the style when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
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
      
      // Add a slight delay before starting animations
      setTimeout(() => {
        setAnimationLoaded(true);
      }, 300);
    }
  }, [isLoggedIn]);

  // Card color schemes
  const cardThemes = [
    { bgColor: "#e3f2fd", bgHover: "#bbdefb", iconColor: "#1976d2", countColor: "#0d47a1" },
    { bgColor: "#e8f5e9", bgHover: "#c8e6c9", iconColor: "#388e3c", countColor: "#1b5e20" },
    { bgColor: "#fff3e0", bgHover: "#ffe0b2", iconColor: "#f57c00", countColor: "#e65100" },
    { bgColor: "#ede7f6", bgHover: "#d1c4e9", iconColor: "#7b1fa2", countColor: "#4a148c" }
  ];

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
                              className={animationLoaded ? "slide-in-card" : ""}
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                p: 0.5,
                                boxShadow: 2,
                                borderRadius: 2,
                                bgcolor: cardThemes[index].bgColor,
                                minHeight: 150,
                                maxWidth: 280,
                                mx: "auto",
                                opacity: animationLoaded ? 1 : 0,
                                transition: "all 0.3s ease-in-out",
                                "&:hover": {
                                  boxShadow: 6,
                                  bgcolor: cardThemes[index].bgHover,
                                  transform: "translateY(-8px)",
                                  cursor: "pointer"
                                },
                              }}
                            >
                              <div className="card-icon" style={{ 
                                color: cardThemes[index].iconColor,
                                padding: "8px",
                                borderRadius: "50%",
                                display: "flex",
                                margin: "10px 0 5px 0"
                              }}>
                                {card.icon}
                              </div>
                              <CardContent
                                sx={{ textAlign: "center", padding: "8px" }}
                              >
                                <Typography
                                  className="card-title"
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {card.title}
                                </Typography>
                                <Typography 
                                  className="card-count"
                                  variant="h5" 
                                  sx={{
                                    display: "inline-block",
                                    color: cardThemes[index].countColor,
                                    animation: animationLoaded ? "fadeIn 1s forwards" : "none",
                                    animationDelay: `${0.6 + index * 0.2}s`
                                  }}
                                >
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