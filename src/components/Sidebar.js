import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ProjectIcon from "@mui/icons-material/Assignment";
import CreateIcon from "@mui/icons-material/AddCircle";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, link: "/" },
    {
      text: "Project Manager",
      icon: <ProjectIcon />, 
      link: "/project-manager",
      apiEndpoint: "https://api.capture360.ai/building/projectlist/",
    },
    {
      text: "Create Manager",
      icon: <CreateIcon />, 
      link: "/create-manager",
      apiEndpoint: "https://api.capture360.ai/building/create_user/",
    },
  ];

  const handleNavigation = (link, apiEndpoint) => {
    navigate(link, { state: { apiEndpoint, title: link === "/create-manager" ? "Create Manager" : "Project Manager" } });
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 10,
          left: isOpen ? 250 : 0,
          zIndex: 1301,
          transition: "left 0.3s ease",
        }}
      >
        <Tooltip title={isOpen ? "Close Sidebar" : "Open Sidebar"}>
          <IconButton
            onClick={toggleSidebar}
            style={{
              background: "linear-gradient(135deg, #004e92, #000428)",
              color: "white",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
              transition: "background 0.3s ease",
            }}
          >
            {isOpen ? <ArrowLeftIcon /> : <ArrowRightIcon />}
          </IconButton>
        </Tooltip>
      </div>

      <Drawer
        variant="persistent"
        anchor="left"
        open={isOpen}
        PaperProps={{
          style: {
            background: "linear-gradient(135deg, #004e92, #000428)",
            color: "white",
            width: 250,
            overflowY: "auto",
            transition: "transform 0.3s ease",
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.link, item.apiEndpoint)}
              style={{
                margin: "8px 0",
                padding: "12px 16px",
                transition: "all 0.2s ease",
                backgroundColor: location.pathname === item.link ? "rgba(255, 255, 255, 0.2)" : "transparent",
              }}
            >
              <ListItemIcon style={{ color: "white", marginRight: "12px" }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} style={{ fontSize: "16px", fontWeight: 500 }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;