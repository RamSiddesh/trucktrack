import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';

// MUI components
import {
  AppBar,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';

// MUI icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListAltIcon from '@mui/icons-material/ListAlt';
import NavigationIcon from '@mui/icons-material/Navigation';
import MessageIcon from '@mui/icons-material/Message';
import FolderIcon from '@mui/icons-material/Folder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LanguageIcon from '@mui/icons-material/Language';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';

const DriverLayout = ({ user, toggleDarkMode, darkMode }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for menus
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageMenu, setLanguageMenu] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Navigation items
  const navItems = [
    { text: t('driver.dashboard.title'), icon: <DashboardIcon />, path: '/driver' },
    { text: t('driver.tasks.title'), icon: <ListAltIcon />, path: '/driver/tasks' },
    { text: t('driver.navigation.title'), icon: <NavigationIcon />, path: '/driver/navigation' },
    { text: t('driver.messages.title'), icon: <MessageIcon />, path: '/driver/messages' },
    { text: t('driver.documents.title'), icon: <FolderIcon />, path: '/driver/documents' },
  ];
  
  // Get current navigation value based on path
  const getCurrentNavValue = () => {
    const path = location.pathname;
    if (path === '/driver') return 0;
    if (path === '/driver/tasks') return 1;
    if (path === '/driver/navigation') return 2;
    if (path === '/driver/messages') return 3;
    if (path === '/driver/documents') return 4;
    return 0;
  };
  
  // Handle user menu
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  // Handle language menu
  const handleLanguageMenuOpen = (event) => {
    setLanguageMenu(event.currentTarget);
  };
  
  const handleLanguageMenuClose = () => {
    setLanguageMenu(null);
  };
  
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    handleLanguageMenuClose();
  };
  
  // Handle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  // Drawer content
  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation">
      <Toolbar sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <Typography variant="h6" component="div">
          {t('app.name')}
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItem>
          <ListItemText 
            primary={user?.name || 'Driver'} 
            secondary={user?.email || ''} 
            primaryTypographyProps={{ fontWeight: 'bold' }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemButton onClick={toggleDarkMode}>
            <ListItemIcon>
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </ListItemIcon>
            <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
        <ListItem>
          <ListItemButton onClick={handleLanguageMenuOpen}>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary="Language" />
          </ListItemButton>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('auth.logout')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {navItems[getCurrentNavValue()]?.text || t('driver.dashboard.title')}
          </Typography>
          
          {/* User avatar */}
          <Tooltip title={user?.name || 'User'}>
            <IconButton
              onClick={handleUserMenuOpen}
              color="inherit"
            >
              {user?.profilePicture ? (
                <Avatar alt={user.name} src={user.profilePicture} sx={{ width: 32, height: 32 }} />
              ) : (
                <AccountCircleIcon />
              )}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* Side Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
      >
        {drawerContent}
      </Drawer>
      
      {/* Language Menu */}
      <Menu
        anchorEl={languageMenu}
        open={Boolean(languageMenu)}
        onClose={handleLanguageMenuClose}
      >
        <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
        <MenuItem onClick={() => changeLanguage('hi')}>हिंदी (Hindi)</MenuItem>
        {/* Add more languages as needed */}
      </Menu>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          mt: '64px', // AppBar height
          mb: '56px', // BottomNavigation height
        }}
      >
        <Outlet />
      </Box>
      
      {/* Bottom Navigation - Mobile Friendly */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 1100,
        }} 
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={getCurrentNavValue()}
          onChange={(event, newValue) => {
            navigate(navItems[newValue].path);
          }}
        >
          {navItems.map((item, index) => (
            <BottomNavigationAction 
              key={item.path}
              label={item.text} 
              icon={item.icon} 
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default DriverLayout;