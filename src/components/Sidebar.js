import React from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ProjectIcon from '@mui/icons-material/Assignment';
import CreateIcon from '@mui/icons-material/AddCircle';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navigate = useNavigate();

  const styles = {
    sidebarPaper: {
      background: 'linear-gradient(135deg, #004e92, #000428)',
      color: 'white',
      borderRadius: '10px',
      overflowY: 'auto',
      transition: 'transform 0.3s ease',
    },
    sidebarListItem: {
      margin: '8px 0',
      borderRadius: '6px',
      padding: '12px 16px',
      transition: 'all 0.2s ease',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
    },
    sidebarListItemHover: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'scale(1.05)',
      cursor: 'pointer',
    },
    sidebarListItemIcon: {
      color: 'white',
      marginRight: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sidebarListText: {
      fontSize: '16px',
      fontWeight: 500,
    },
    toggleButton: {
      background: 'linear-gradient(135deg, #004e92, #000428)',
      color: 'white',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
      zIndex: 1300,
      transition: 'all 0.3s ease',
    },
    toggleButtonHover: {
      background: 'linear-gradient(135deg, #005fa4, #002340)',
    },
    toggleButtonWrapper: {
      position: 'fixed',
      top: '10px',
      left: isOpen ? '240px' : '0',
      zIndex: 1301,
      transition: 'left 0.3s ease',
    },
    activeItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, link: '/' },
    {
      text: 'Project Manager',
      icon: <ProjectIcon />,
      link: '/project-manager',
      apiEndpoint: 'https://api.capture360.ai/building/projectlist/',
    },
    {
      text: 'Create Manager',
      icon: <CreateIcon />,
      link: '/create-manager',
      apiEndpoint: 'https://api.capture360.ai/building/create_user/',
    },
  ];

  const handleNavigation = (link, apiEndpoint) => {
    navigate(link, { state: { apiEndpoint, title: link === '/create-manager' ? 'Create Manager' : 'Project Manager' } });
  };

  return (
    <>
      <div style={styles.toggleButtonWrapper}>
        <IconButton
          style={styles.toggleButton}
          onClick={toggleSidebar}
          onMouseEnter={(e) => (e.target.style.background = styles.toggleButtonHover.background)}
          onMouseLeave={(e) => (e.target.style.background = styles.toggleButton.background)}
        >
          {isOpen ? <ArrowLeftIcon /> : <ArrowRightIcon />}
        </IconButton>
      </div>

      <Drawer
        variant="persistent"
        anchor="left"
        open={isOpen}
        PaperProps={{ style: styles.sidebarPaper }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => handleNavigation(item.link, item.apiEndpoint)}
              style={{
                ...styles.sidebarListItem,
                ...(window.location.pathname === item.link ? styles.activeItem : {}),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = styles.sidebarListItemHover.backgroundColor;
                e.currentTarget.style.transform = styles.sidebarListItemHover.transform;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <ListItemIcon style={styles.sidebarListItemIcon}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} style={styles.sidebarListText} />
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
};

export default Sidebar;
