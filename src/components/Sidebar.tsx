import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  IconButton,
  Avatar,
  Drawer,
} from '@mui/material';
import {
  Dashboard,
  People,
  Store,
  Analytics,
  AdminPanelSettings,
  Storefront,
  TrendingUp,
  Chat,
  Reviews,
  Settings,
  Logout,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { getCurrentAdmin, logoutAdmin } from '../utils/authUtils';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose, currentPage, onNavigate }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const adminUser = getCurrentAdmin();

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Dashboard />,
      path: '/admin',
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <People />,
      path: '/admin/users',
    },
    {
      id: 'products',
      label: 'Product Management',
      icon: <Store />,
      path: '/admin/products',
    },
    {
      id: 'shops',
      label: 'Shop Management',
      icon: <Storefront />,
      path: '/admin/shops',
    },
    {
      id: 'bids',
      label: 'Bid Management',
      icon: <TrendingUp />,
      path: '/admin/bids',
    },
    {
      id: 'chats',
      label: 'Chat Management',
      icon: <Chat />,
      path: '/admin/chats',
    },
    {
      id: 'reviews',
      label: 'Review Management',
      icon: <Reviews />,
      path: '/admin/reviews',
    },
    {
      id: 'analytics',
      label: 'Analytics & Reports',
      icon: <Analytics />,
      path: '/admin/analytics',
    },
  ];

  const handleLogout = () => {
    logoutAdmin();
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: '#FFD5A1', borderBottom: '1px solid rgba(255, 213, 161, 0.3)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AdminPanelSettings sx={{ mr: 1, color: '#5D4037', fontSize: 28 }} />
            <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 700 }}>
              PakRiceMarket Admin
            </Typography>
          </Box>
          {isMobile && (
            <IconButton onClick={onClose} sx={{ color: '#5D4037' }}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Admin Info */}
      <Box sx={{ p: 2, bgcolor: 'rgba(255, 213, 161, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#D4A574', mr: 2, width: 40, height: 40 }}>
            {adminUser?.name?.charAt(0) || adminUser?.email?.charAt(0) || 'A'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
              {adminUser?.name || 'Admin User'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8D6E63' }}>
              {adminUser?.email || 'admin@PakRiceMarket.com'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              onClick={() => {
                onNavigate(item.path);
                if (isMobile) onClose();
              }}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                bgcolor: currentPage === item.id ? 'rgba(255, 213, 161, 0.2)' : 'transparent',
                '&:hover': {
                  bgcolor: 'rgba(255, 213, 161, 0.1)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: currentPage === item.id ? '#FFD5A1' : '#8D6E63',
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  '& .MuiListItemText-primary': {
                    color: currentPage === item.id ? '#5D4037' : '#8D6E63',
                    fontWeight: currentPage === item.id ? 600 : 400,
                    fontSize: '0.9rem',
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Settings & Logout */}
      <List sx={{ py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => onNavigate('/admin/settings')}
            sx={{
              mx: 1,
              borderRadius: 2,
              mb: 0.5,
              '&:hover': {
                bgcolor: 'rgba(255, 213, 161, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#8D6E63', minWidth: 40 }}>
              <Settings />
            </ListItemIcon>
            <ListItemText
              primary="Settings"
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#8D6E63',
                  fontSize: '0.9rem',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              mx: 1,
              borderRadius: 2,
              '&:hover': {
                bgcolor: 'rgba(255, 213, 161, 0.1)',
              },
            }}
          >
            <ListItemIcon sx={{ color: '#E57373', minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                '& .MuiListItemText-primary': {
                  color: '#E57373',
                  fontSize: '0.9rem',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(255, 213, 161, 0.2)',
            bgcolor: '#FEFCF8',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 280,
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1200,
        borderRight: '1px solid rgba(255, 213, 161, 0.2)',
        bgcolor: '#FEFCF8',
        overflow: 'hidden',
      }}
    >
      {drawerContent}
    </Box>
  );
};

export default Sidebar;
