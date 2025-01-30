import React, { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from "./components/Sidebar";
import CustomCard from "./components/CustomCard";
import LoginPage from "./components/LoginPage";
import DataPage from "./components/DataPage";
import PlanDetailsPage from "./components/PlanDetailsPage";
import PlanDetailViewPage from "./components/PlanDetailViewPage";
import CreateDataPage from "./components/CreateDataPage"; // Ensure correct import
import ImageGalleryComponent from "./components/ImageGalleryComponent";
import ImageViewPage from "./components/ImageViewPage";
import CreatePlanDataPage from "./components/CreatePlanDataPage";
import VidPage from "./components/VidPage";
import ProjectTable from "./components/ProjectTable";
import RegisterForm from "./components/RegisterForm";
import ProjectTab from "./components/ProjectTab"; // Ensure correct import
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import "./App.css";

const theme = createTheme({
  palette: {
    mode: 'light',
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
    setIsSidebarOpen(prevState => !prevState);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch("https://api.capture360.ai/building/projectlist/", {
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        setTotalProjects(data.length);
        setLiveProjects(data.length);
      } catch (error) {
        console.error("Failed to fetch project data:", error);
      }
    };

    const fetchEmployeeData = async () => {
      try {
        const response = await fetch("https://api.capture360.ai/building/create_user/", {
          headers: { Accept: "application/json" },
        });
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
      <div className={`App main-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        {isLoggedIn ? (
          <>
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="content">
              <div className="top-bar">
                <div className="right-side">
                  <input type="text" className="search-bar" placeholder="Search..." />
                  <div className="profile">Profile</div>
                </div>
              </div>
              <Routes>
                <Route path="/" element={
                  <>
                    <div className="card-container">
                      <CustomCard title="Total Project" count={totalProjects} />
                      <CustomCard title="Live Project" count={liveProjects} />
                      <CustomCard title="Total User" count={totalEmployees} />
                      <CustomCard title="Live User" count={liveEmployees} />
                    </div>
                    <ProjectTable />
                  </>
                } />
                <Route path="/data" element={<DataPage />} />
                <Route path="/Sidebar" element={<Sidebar />} />
                <Route path="/plan-details" element={<PlanDetailsPage />} />
                <Route path="/plan-detail-view" element={<PlanDetailViewPage />} />
                <Route path="/CreateDataPage" element={<CreateDataPage />} /> {/* Updated route path */}
                <Route path="/project-manager" element={<DataPage />} />
                <Route path="/ProjectTab" element={<ProjectTab />} /> {/* Updated route path */}
                <Route path="/ProjectTable" element={<ProjectTable />} /> {/* Updated route path */}
                <Route path="/create-manager" element={<DataPage createUser={true} />} />
                <Route path="/image-gallery" element={<ImageGalleryComponent />} />
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
