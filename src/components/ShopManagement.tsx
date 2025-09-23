import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Search,
  CheckCircle,
  MoreVert,
  Store,
  Star,
  Refresh,
  Visibility,
  Edit,
  Delete,
  StarBorder,
  Phone,
  Email,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { AdminManagementService, TrustMartUser } from '../services/adminManagementService';

interface ShopManagementProps {}

const ShopManagement: React.FC<ShopManagementProps> = () => {
  const [shops, setShops] = useState<TrustMartUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'view' | 'edit' | 'delete' | 'feature' | 'unfeature';
    shop: TrustMartUser | null;
  }>({
    open: false,
    type: 'view',
    shop: null,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionShop, setActionShop] = useState<TrustMartUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminManagementService.getShops(1000);
      setShops(result.shops);
    } catch (err) {
      console.error('Error loading shops:', err);
      setError('Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const handleFeatureShop = async (shop: TrustMartUser) => {
    try {
      setActionLoading(shop.id);
      console.log(`🔄 Featuring shop ${shop.id} (${shop.name})`);
      await AdminManagementService.updateShopFeaturedStatus(shop.id, true);
      setShops(prev => prev.map(s => 
        s.id === shop.id ? { ...s, isFeatured: true } : s
      ));
      setActionDialog({ open: false, type: 'view', shop: null });
      setError(null);
      console.log(`✅ Shop ${shop.id} featured successfully`);
    } catch (err) {
      console.error('Error featuring shop:', err);
      setError('Failed to feature shop. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnfeatureShop = async (shop: TrustMartUser) => {
    try {
      setActionLoading(shop.id);
      console.log(`🔄 Unfeaturing shop ${shop.id} (${shop.name})`);
      await AdminManagementService.updateShopFeaturedStatus(shop.id, false);
      setShops(prev => prev.map(s => 
        s.id === shop.id ? { ...s, isFeatured: false } : s
      ));
      setActionDialog({ open: false, type: 'view', shop: null });
      setError(null);
      console.log(`✅ Shop ${shop.id} unfeatured successfully`);
    } catch (err) {
      console.error('Error unfeaturing shop:', err);
      setError('Failed to unfeature shop. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, shop: TrustMartUser) => {
    setAnchorEl(event.currentTarget);
    setActionShop(shop);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionShop(null);
  };

  const handleActionClick = (action: string, shop?: TrustMartUser) => {
    const targetShop = shop || actionShop;
    if (targetShop) {
      setActionDialog({ 
        open: true, 
        type: action as any, 
        shop: targetShop 
      });
    }
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setActionDialog({ open: false, type: 'view', shop: null });
  };

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || shop.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && shop.isApproved) ||
                         (filterStatus === 'blocked' && !shop.isApproved);
    const matchesFeatured = filterFeatured === 'all' ||
                           (filterFeatured === 'featured' && shop.isFeatured) ||
                           (filterFeatured === 'not-featured' && !shop.isFeatured);
    
    return matchesSearch && matchesRole && matchesStatus && matchesFeatured;
  });

  const paginatedShops = filteredShops.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredShops.length / rowsPerPage);

  const getStatusColor = (isApproved: boolean) => {
    return isApproved ? '#8BC34A' : '#E57373';
  };

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? 'Active' : 'Blocked';
  };

  const getFeaturedColor = (isFeatured: boolean) => {
    return isFeatured ? '#FFD700' : '#8D6E63';
  };

  const getFeaturedText = (isFeatured: boolean) => {
    return isFeatured ? 'Featured' : 'Regular';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress sx={{ color: '#FFD5A1' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 2, color: '#5D4037' }}>
          Virtual Shop Management
        </Typography>
        <Typography variant="h6" sx={{ color: '#8D6E63' }}>
          Manage all virtual shops and their featured status
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search virtual shops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#8D6E63' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
            
            <TextField
              select
              label="Shop Type"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="user">User Shop</MenuItem>
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="company">Company</MenuItem>
              <MenuItem value="commissioner">Commissioner</MenuItem>
            </TextField>

            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="approved">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>

            <TextField
              select
              label="Featured"
              value={filterFeatured}
              onChange={(e) => setFilterFeatured(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Shops</MenuItem>
              <MenuItem value="featured">Featured</MenuItem>
              <MenuItem value="not-featured">Regular</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadShops}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Shops Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FEFCF8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Virtual Shop</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Featured</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedShops.map((shop) => (
                <TableRow key={shop.id} sx={{ '&:hover': { bgcolor: '#FFF8E1' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={shop.profileImage}
                        sx={{ width: 48, height: 48, bgcolor: '#FFD5A1' }}
                      >
                        <Store sx={{ color: '#5D4037' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#5D4037' }}>
                          {shop.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                          {shop.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<Store fontSize="small" />}
                      label={shop.role.charAt(0).toUpperCase() + shop.role.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: shop.role === 'user' ? '#8BC34A' :
                                shop.role === 'shop' ? '#64B5F6' :
                                shop.role === 'company' ? '#FF9800' :
                                '#9C27B0',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(shop.isApproved)}
                      size="small"
                      sx={{
                        bgcolor: getStatusColor(shop.isApproved),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={shop.isFeatured ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                      label={getFeaturedText(shop.isFeatured)}
                      size="small"
                      sx={{
                        bgcolor: getFeaturedColor(shop.isFeatured),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: '#FFD5A1', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#5D4037' }}>
                        {shop.averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8D6E63', ml: 0.5 }}>
                        ({shop.totalReviews})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#5D4037' }}>
                      {new Date(shop.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Shop Details">
                        <IconButton
                          size="small"
                          onClick={() => handleActionClick('view', shop)}
                          sx={{ color: '#64B5F6' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>

                      {shop.isFeatured ? (
                        <Tooltip title="Unfeature Shop">
                          <IconButton
                            size="small"
                            onClick={() => handleUnfeatureShop(shop)}
                            disabled={actionLoading === shop.id}
                            sx={{ color: '#FF9800' }}
                          >
                            {actionLoading === shop.id ? (
                              <CircularProgress size={16} sx={{ color: '#FF9800' }} />
                            ) : (
                              <StarBorder />
                            )}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Feature Shop">
                          <IconButton
                            size="small"
                            onClick={() => handleFeatureShop(shop)}
                            disabled={actionLoading === shop.id}
                            sx={{ color: '#FFD700' }}
                          >
                            {actionLoading === shop.id ? (
                              <CircularProgress size={16} sx={{ color: '#FFD700' }} />
                            ) : (
                              <Star />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}

                      <Tooltip title="More Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, shop)}
                          sx={{ color: '#8D6E63' }}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, newPage) => setPage(newPage)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  color: '#5D4037',
                },
                '& .Mui-selected': {
                  bgcolor: '#FFD5A1',
                  color: '#5D4037',
                },
              }}
            />
          </Box>
        )}
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleActionClick('view')}>
          <ListItemIcon>
            <Visibility />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('delete')} sx={{ color: '#E57373' }}>
          <ListItemIcon>
            <Delete sx={{ color: '#E57373' }} />
          </ListItemIcon>
          <ListItemText>Delete Shop</ListItemText>
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <Dialog 
        open={actionDialog.open} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#FEFCF8', color: '#5D4037', fontWeight: 600 }}>
          {actionDialog.type === 'view' && 'Virtual Shop Details'}
          {actionDialog.type === 'delete' && 'Delete Virtual Shop'}
          {actionDialog.type === 'feature' && 'Feature Virtual Shop'}
          {actionDialog.type === 'unfeature' && 'Unfeature Virtual Shop'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {actionDialog.shop && actionDialog.type === 'view' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={actionDialog.shop.profileImage}
                  sx={{ width: 64, height: 64, bgcolor: '#FFD5A1' }}
                >
                  <Store sx={{ color: '#5D4037', fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600 }}>
                    {actionDialog.shop.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                    Virtual Shop Owner
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Chip
                    label={getStatusText(actionDialog.shop.isApproved)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(actionDialog.shop.isApproved),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                    Featured
                  </Typography>
                  <Chip
                    icon={actionDialog.shop.isFeatured ? <Star fontSize="small" /> : <StarBorder fontSize="small" />}
                    label={getFeaturedText(actionDialog.shop.isFeatured)}
                    size="small"
                    sx={{
                      bgcolor: getFeaturedColor(actionDialog.shop.isFeatured),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: '#8D6E63', fontSize: 20 }} />
                  <Typography variant="body2">{actionDialog.shop.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ color: '#8D6E63', fontSize: 20 }} />
                  <Typography variant="body2">{actionDialog.shop.phone || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ color: '#8D6E63', fontSize: 20 }} />
                  <Typography variant="body2">{actionDialog.shop.address || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ color: '#8D6E63', fontSize: 20 }} />
                  <Typography variant="body2">
                    Joined {new Date(actionDialog.shop.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: '#FFD5A1', fontSize: 20 }} />
                  <Typography variant="body2">
                    {actionDialog.shop.averageRating.toFixed(1)} rating ({actionDialog.shop.totalReviews} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

          {actionDialog.shop && actionDialog.type !== 'view' && (
            <Typography variant="body1" sx={{ color: '#5D4037' }}>
              Are you sure you want to {actionDialog.type} "{actionDialog.shop.name}"?
              {actionDialog.type === 'delete' && ' This action cannot be undone.'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleDialogClose} sx={{ color: '#8D6E63' }}>
            {actionDialog.type === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {actionDialog.type !== 'view' && (
            <Button
              variant="contained"
              onClick={() => {
                if (actionDialog.shop) {
                  switch (actionDialog.type) {
                    case 'feature':
                      handleFeatureShop(actionDialog.shop);
                      break;
                    case 'unfeature':
                      handleUnfeatureShop(actionDialog.shop);
                      break;
                    case 'delete':
                      // handleDeleteShop(actionDialog.shop);
                      break;
                  }
                }
              }}
              sx={{
                bgcolor: actionDialog.type === 'delete' ? '#E57373' : '#FFD5A1',
                color: actionDialog.type === 'delete' ? 'white' : '#5D4037',
                '&:hover': {
                  bgcolor: actionDialog.type === 'delete' ? '#D32F2F' : '#D4A574',
                },
              }}
            >
              {actionDialog.type === 'delete' && 'Delete'}
              {actionDialog.type === 'feature' && 'Feature'}
              {actionDialog.type === 'unfeature' && 'Unfeature'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShopManagement;
