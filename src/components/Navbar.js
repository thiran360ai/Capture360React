import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';

const Navbar = ({ toggleSidebar }) => {
  return (
    <AppBar position="fixed" className="navbar">
      <Toolbar className="navbar-toolbar">
        <IconButton edge="start" aria-label="menu" onClick={toggleSidebar} className="navbar-icon">
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" className="navbar-title">
          Admin Panel
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
