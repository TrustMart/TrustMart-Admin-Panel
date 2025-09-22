import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { AdminManagementService, TrustMartUser, TrustMartProduct, TrustMartBid } from '../services/adminManagementService';

interface AnalyticsChartsProps {
  data?: {
    users: any[];
    products: any[];
    bids: any[];
    revenue: any[];
  };
}

interface RealTimeData {
  userGrowthData: any[];
  productCategoryData: any[];
  bidTrendData: any[];
  revenueData: any[];
  keyMetrics: {
    totalUsers: number;
    activeProducts: number;
    totalBids: number;
    revenue: number;
  };
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRealTimeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [users, products, bids, dashboardStats] = await Promise.all([
        AdminManagementService.getUsers(1000), // Get more users for better analytics
        AdminManagementService.getProducts(1000), // Get more products for better analytics
        AdminManagementService.getBids(),
        AdminManagementService.getDashboardStats()
      ]);

      // Process user growth data (last 6 months)
      const userGrowthData = processUserGrowthData(users.users);
      
      // Process product category data
      const productCategoryData = processProductCategoryData(products.products);
      
      // Process bid trend data (last 4 weeks)
      const bidTrendData = processBidTrendData(bids);
      
      // Process revenue data (estimated from products and bids)
      const revenueData = processRevenueData(products.products, bids);

      
      setRealTimeData({
        userGrowthData,
        productCategoryData,
        bidTrendData,
        revenueData,
        keyMetrics: {
          totalUsers: dashboardStats.totalUsers,
          activeProducts: dashboardStats.activeProducts,
          totalBids: dashboardStats.totalBids,
          revenue: calculateTotalRevenue(products.products, bids)
        }
      });
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRealTimeData();
  }, [loadRealTimeData]);

  // Helper functions to process real data
  const processUserGrowthData = (users: TrustMartUser[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const monthStart = new Date(new Date().getFullYear(), monthIndex, 1);
      const monthEnd = new Date(new Date().getFullYear(), monthIndex + 1, 0);
      
      const monthUsers = users.filter(user => {
        const userDate = user.createdAt;
        return userDate >= monthStart && userDate <= monthEnd;
      });
      
      const totalUsers = users.filter(user => user.createdAt <= monthEnd).length;
      
      return {
        month,
        users: totalUsers,
        newUsers: monthUsers.length
      };
    });
  };

  const processProductCategoryData = (products: TrustMartProduct[]) => {
    const categoryCount: { [key: string]: number } = {};
    
    products.forEach(product => {
      const category = product.category || 'Uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const colors = ['#FFD5A1', '#D4A574', '#8BC34A', '#64B5F6', '#E57373'];
    
    return Object.entries(categoryCount)
      .map(([name, count], index) => ({
        name,
        value: count,
        count,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 categories
  };

  const processBidTrendData = (bids: TrustMartBid[]) => {
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const currentDate = new Date();
    
    return weeks.map((week, index) => {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - (4 - index) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekBids = bids.filter(bid => {
        const bidDate = bid.createdAt;
        return bidDate >= weekStart && bidDate <= weekEnd;
      });
      
      const acceptedBids = weekBids.filter(bid => bid.isAccepted).length;
      
      return {
        week,
        total: weekBids.length,
        accepted: acceptedBids,
        rejected: weekBids.length - acceptedBids
      };
    });
  };

  const processRevenueData = (products: TrustMartProduct[], bids: TrustMartBid[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentMonth = new Date().getMonth();
    
    return months.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const monthStart = new Date(new Date().getFullYear(), monthIndex, 1);
      const monthEnd = new Date(new Date().getFullYear(), monthIndex + 1, 0);
      
      const monthProducts = products.filter(product => {
        const productDate = new Date(product.createdAt);
        return productDate >= monthStart && productDate <= monthEnd;
      });
      
      const monthBids = bids.filter(bid => {
        const bidDate = bid.createdAt;
        return bidDate >= monthStart && bidDate <= monthEnd && bid.isAccepted;
      });
      
      const revenue = monthProducts.reduce((sum, product) => sum + product.price, 0);
      const profit = monthBids.reduce((sum, bid) => sum + bid.amount * 0.1, 0); // 10% commission
      
      return {
        month,
        revenue: Math.round(revenue),
        profit: Math.round(profit)
      };
    });
  };

  const calculateTotalRevenue = (products: TrustMartProduct[], bids: TrustMartBid[]) => {
    const acceptedBids = bids.filter(bid => bid.isAccepted);
    return Math.round(acceptedBids.reduce((sum, bid) => sum + bid.amount * 0.1, 0)); // 10% commission
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#FFD5A1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1" sx={{ color: '#8D6E63' }}>
          Please check your internet connection and try refreshing the page.
        </Typography>
      </Box>
    );
  }

  if (!realTimeData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ color: '#8D6E63' }}>
          No data available. Please try again later.
        </Typography>
      </Box>
    );
  }

  const { userGrowthData, productCategoryData, bidTrendData, revenueData, keyMetrics } = realTimeData;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, color: '#5D4037', fontWeight: 700 }}>
        Analytics & Reports
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
        gap: 3
      }}>
        {/* User Growth Chart */}
        <Box>
          <Card sx={{ height: 400, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 600 }}>
                User Growth Trend (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#8D6E63" />
                  <YAxis stroke="#8D6E63" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 8,
                      border: '1px solid #FFD5A1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ color: '#5D4037' }}
                    labelStyle={{ color: '#5D4037', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Area type="monotone" dataKey="users" stroke="#FFD5A1" fill="#FFD5A1" fillOpacity={0.3} name="Total Users" />
                  <Area type="monotone" dataKey="newUsers" stroke="#D4A574" fill="#D4A574" fillOpacity={0.3} name="New Users" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Product Categories Pie Chart */}
        <Box>
          <Card sx={{ height: 400, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 600 }}>
                Product Categories Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {productCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 8,
                      border: '1px solid #FFD5A1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ color: '#5D4037' }}
                    labelStyle={{ color: '#5D4037', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        gap: 3,
        mt: 3
      }}>
        {/* Bid Trends Chart */}
        <Box>
          <Card sx={{ height: 350, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 600 }}>
                Weekly Bid Trends (Last 4 Weeks)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={bidTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="week" stroke="#8D6E63" />
                  <YAxis stroke="#8D6E63" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 8,
                      border: '1px solid #FFD5A1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ color: '#5D4037' }}
                    labelStyle={{ color: '#5D4037', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Bar dataKey="total" fill="#FFD5A1" name="Total Bids" />
                  <Bar dataKey="accepted" fill="#8BC34A" name="Accepted Bids" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Revenue Chart */}
        <Box>
          <Card sx={{ height: 350, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 600 }}>
                Revenue & Profit (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="month" stroke="#8D6E63" />
                  <YAxis stroke="#8D6E63" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: 8,
                      border: '1px solid #FFD5A1',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    itemStyle={{ color: '#5D4037' }}
                    labelStyle={{ color: '#5D4037', fontWeight: 600 }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#FFD5A1" activeDot={{ r: 8 }} name="Revenue (PKR)" />
                  <Line type="monotone" dataKey="profit" stroke="#8BC34A" name="Profit (PKR)" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
        mt: 3
      }}>
        {[
          { title: 'Total Users', value: keyMetrics.totalUsers.toLocaleString(), change: '+12%', color: '#FFD5A1' },
          { title: 'Active Products', value: keyMetrics.activeProducts.toLocaleString(), change: '+8%', color: '#8BC34A' },
          { title: 'Total Bids', value: keyMetrics.totalBids.toLocaleString(), change: '+15%', color: '#64B5F6' },
          { title: 'Revenue (PKR)', value: `₨${keyMetrics.revenue.toLocaleString()}`, change: '+22%', color: '#D4A574' },
        ].map((metric, index) => (
          <Box key={index}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
                border: '1px solid rgba(255, 213, 161, 0.2)',
                background: `linear-gradient(135deg, ${metric.color}1A 0%, ${metric.color}0A 100%)`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600, mb: 1 }}>
                  {metric.title}
                </Typography>
                <Typography variant="h4" sx={{ color: metric.color, fontWeight: 700, mb: 1 }}>
                  {metric.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#8BC34A', fontWeight: 600 }}>
                  {metric.change} from last month
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AnalyticsCharts;