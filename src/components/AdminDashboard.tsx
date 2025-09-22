import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { requireAuth } from '../utils/authUtils';
import { AdminManagementService } from '../services/adminManagementService';
import DashboardLayout from './DashboardLayout';

const AdminDashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('/admin');
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalBids: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    activeProducts: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!requireAuth()) {
      return;
    }
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const stats = await AdminManagementService.getDashboardStats();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const dashboardContent = (
    <Box sx={{ p: 3 }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#5D4037' }}>
          Dashboard Overview
        </Typography>
        <Typography variant="h6" sx={{ color: '#8D6E63' }}>
          Manage your rice marketplace with powerful administration tools
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3, color: '#5D4037' }}>
          PakRiceMarket Marketplace Overview
        </Typography>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3
        }}>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
            border: '1px solid rgba(255, 213, 161, 0.2)',
            background: 'linear-gradient(135deg, rgba(255, 213, 161, 0.1) 0%, rgba(255, 213, 161, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#FFD5A1', mb: 1 }}>
                {isLoading ? '...' : dashboardStats.totalProducts.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8D6E63' }}>
                Total Products
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
            border: '1px solid rgba(212, 165, 116, 0.2)',
            background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1) 0%, rgba(212, 165, 116, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#D4A574', mb: 1 }}>
                {isLoading ? '...' : dashboardStats.totalUsers.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8D6E63' }}>
                Total Users
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
            border: '1px solid rgba(139, 195, 74, 0.2)',
            background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8BC34A', mb: 1 }}>
                {isLoading ? '...' : dashboardStats.totalBids.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8D6E63' }}>
                Total Bids
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ 
            p: 3, 
            textAlign: 'center', 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
            border: '1px solid rgba(100, 181, 246, 0.2)',
            background: 'linear-gradient(135deg, rgba(100, 181, 246, 0.1) 0%, rgba(100, 181, 246, 0.05) 100%)',
          }}>
            <CardContent sx={{ p: 0 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#64B5F6', mb: 1 }}>
                {isLoading ? '...' : dashboardStats.pendingApprovals.toLocaleString()}
              </Typography>
              <Typography variant="body1" sx={{ color: '#8D6E63' }}>
                Pending Approvals
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );

  return (
    <DashboardLayout 
      currentPage={currentPage} 
      onNavigate={handleNavigate}
    >
      {dashboardContent}
    </DashboardLayout>
  );
};

export default AdminDashboard;