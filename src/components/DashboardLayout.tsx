import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  CssBaseline,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications,
  AccountCircle,
} from '@mui/icons-material';
import Sidebar from './Sidebar';
import AnalyticsCharts from './AnalyticsCharts';
import UserManagement from './UserManagement';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  currentPage, 
  onNavigate 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useEffect(() => {
    // Initialize admin user if needed
  }, []);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderPageContent = () => {
    switch (currentPage) {
          case '/admin':
            return <AnalyticsCharts />;
      case '/admin/users':
        return <UserManagement />;
      case '/admin/products':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700, mb: 3 }}>
              Product Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63' }}>
              Product management features coming soon...
            </Typography>
          </Box>
        );
      case '/admin/shops':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700, mb: 3 }}>
              Shop Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63' }}>
              Shop management features coming soon...
            </Typography>
          </Box>
        );
      case '/admin/bids':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700, mb: 3 }}>
              Bid Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63' }}>
              Bid management features coming soon...
            </Typography>
          </Box>
        );
      case '/admin/chats':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700, mb: 3 }}>
              Chat Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63' }}>
              Chat management features coming soon...
            </Typography>
          </Box>
        );
      case '/admin/reviews':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700, mb: 3 }}>
              Review Management
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63' }}>
              Review management features coming soon...
            </Typography>
          </Box>
        );
          case '/admin/analytics':
            return <AnalyticsCharts />;
      case '/admin/settings':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ color: '#5D4037', fontWeight: 700, mb: 3 }}>
              Settings
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63' }}>
              Settings features coming soon...
            </Typography>
          </Box>
        );
          default:
            return children || <AnalyticsCharts />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FEFCF8' }}>
      <CssBaseline />
      
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={handleSidebarClose}
        currentPage={currentPage}
        onNavigate={onNavigate}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: isMobile ? '100%' : 'calc(100% - 280px)',
          marginLeft: isMobile ? 0 : '280px',
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="static"
          sx={{
            bgcolor: '#FFFFFF',
            boxShadow: '0 2px 8px rgba(93, 64, 55, 0.1)',
            borderBottom: '1px solid rgba(255, 213, 161, 0.2)',
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleSidebarToggle}
              edge="start"
              sx={{
                mr: 2,
                color: '#5D4037',
                display: { md: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 1,
                color: '#5D4037',
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              PakRiceMarket Admin Panel
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton sx={{ color: '#8D6E63' }}>
                <Notifications />
              </IconButton>
              <IconButton sx={{ color: '#8D6E63' }}>
                <AccountCircle />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: 'auto',
            bgcolor: '#FEFCF8',
          }}
        >
          {renderPageContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
