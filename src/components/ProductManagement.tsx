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
  Paper,
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
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Divider,
} from '@mui/material';
import {
  Search,
  Block,
  CheckCircle,
  MoreVert,
  Person,
  Star,
  Refresh,
  Visibility,
  Edit,
  Delete,
  ExpandMore,
  Store,
  Category,
  Inventory,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  AttachMoney,
  CalendarToday,
  LocationOn,
} from '@mui/icons-material';
import { AdminManagementService, TrustMartUser, TrustMartProduct } from '../services/adminManagementService';

interface ProductManagementProps {}

interface UserWithProducts extends TrustMartUser {
  products: TrustMartProduct[];
  totalProducts: number;
  activeProducts: number;
  soldProducts: number;
  inactiveProducts: number;
  blockedProducts: number;
}

const ProductManagement: React.FC<ProductManagementProps> = () => {
  const [usersWithProducts, setUsersWithProducts] = useState<UserWithProducts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'view' | 'edit' | 'delete' | 'block' | 'unblock' | 'category';
    product: TrustMartProduct | null;
    user: TrustMartUser | null;
  }>({
    open: false,
    type: 'view',
    product: null,
    user: null,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionProduct, setActionProduct] = useState<TrustMartProduct | null>(null);
  const [actionUser, setActionUser] = useState<TrustMartUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState('');

  const loadUsersWithProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users
      const usersResult = await AdminManagementService.getUsers(1000);
      const users = usersResult.users;
      
      // Get all products
      const productsResult = await AdminManagementService.getProducts(1000);
      const allProducts = productsResult.products;
      
      // Group products by seller (use userId as primary field from TrustMart)
      const productsBySeller = allProducts.reduce((acc, product) => {
        let mapped = false;
        
        // Use userId as primary field (TrustMart app uses this)
        if (product.userId) {
          const userExists = users.find(u => u.id === product.userId);
          if (userExists) {
            if (!acc[product.userId]) {
              acc[product.userId] = [];
            }
            acc[product.userId].push(product);
            mapped = true;
          }
        }
        
        // If userId didn't work, try to match by userName as fallback
        if (!mapped && product.userName) {
          const matchingUsers = users.filter(u => u.name === product.userName);
          if (matchingUsers.length > 0) {
            // If multiple users have the same name, use the first one
            const matchingUser = matchingUsers[0];
            if (!acc[matchingUser.id]) {
              acc[matchingUser.id] = [];
            }
            acc[matchingUser.id].push(product);
            mapped = true;
          }
        }
        
        return acc;
      }, {} as Record<string, TrustMartProduct[]>);
      
      // Create users with their products
      const usersWithProductsData: UserWithProducts[] = users.map(user => {
        const userProducts = productsBySeller[user.id] || [];
        
        // Debug logging to check product statuses
        console.log(`User ${user.name} products:`, userProducts.map(p => ({ id: p.id, name: p.name, status: p.status })));
        
        const activeProducts = userProducts.filter(p => p.status === 'Active').length;
        const soldProducts = userProducts.filter(p => p.status === 'Sold').length;
        const inactiveProducts = userProducts.filter(p => p.status === 'Inactive').length;
        const blockedProducts = userProducts.filter(p => p.status === 'Blocked').length;
        
        return {
          ...user,
          products: userProducts,
          totalProducts: userProducts.length,
          activeProducts,
          soldProducts,
          inactiveProducts,
          blockedProducts,
        };
      });
      
      setUsersWithProducts(usersWithProductsData);
    } catch (err) {
      console.error('Error loading users with products:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersWithProducts();
  }, [loadUsersWithProducts]);

  const handleToggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleBlockProduct = async (product: TrustMartProduct) => {
    try {
      setActionLoading(product.id);
      console.log(`🔄 Blocking product ${product.id} (${product.name}) - Current status: ${product.status}`);
      await AdminManagementService.updateProductStatus(product.id, true); // true = block the product
      
      setUsersWithProducts(prev => prev.map(user => ({
        ...user,
        products: user.products.map(p => 
          p.id === product.id ? { ...p, status: 'Blocked' } : p
        ),
        activeProducts: user.id === product.userId ? 
          user.products.filter(p => p.id === product.id ? false : p.status === 'Active').length :
          user.activeProducts,
        soldProducts: user.id === product.userId ? 
          user.products.filter(p => p.status === 'Sold').length :
          user.soldProducts,
        inactiveProducts: user.id === product.userId ? 
          user.products.filter(p => p.id === product.id ? false : p.status === 'Inactive').length :
          user.inactiveProducts,
        blockedProducts: user.id === product.userId ? 
          user.products.filter(p => p.id === product.id ? true : p.status === 'Blocked').length :
          user.blockedProducts,
      })));
      
      console.log(`✅ Product ${product.id} blocked successfully - Status changed to Blocked`);
      setActionDialog({ open: false, type: 'view', product: null, user: null });
      setError(null);
    } catch (err) {
      console.error('Error blocking product:', err);
      setError('Failed to block product. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockProduct = async (product: TrustMartProduct) => {
    try {
      setActionLoading(product.id);
      console.log(`🔄 Unblocking product ${product.id} (${product.name}) - Current status: ${product.status}`);
      await AdminManagementService.updateProductStatus(product.id, false); // false = unblock the product
      
      setUsersWithProducts(prev => prev.map(user => ({
        ...user,
        products: user.products.map(p => 
          p.id === product.id ? { ...p, status: 'Active' } : p
        ),
        activeProducts: user.id === product.userId ? 
          user.products.filter(p => p.id === product.id ? true : p.status === 'Active').length :
          user.activeProducts,
        soldProducts: user.id === product.userId ? 
          user.products.filter(p => p.status === 'Sold').length :
          user.soldProducts,
        inactiveProducts: user.id === product.userId ? 
          user.products.filter(p => p.status === 'Inactive').length :
          user.inactiveProducts,
        blockedProducts: user.id === product.userId ? 
          user.products.filter(p => p.id === product.id ? false : p.status === 'Blocked').length :
          user.blockedProducts,
      })));
      
      console.log(`✅ Product ${product.id} unblocked successfully - Status changed to Active`);
      setActionDialog({ open: false, type: 'view', product: null, user: null });
      setError(null);
    } catch (err) {
      console.error('Error unblocking product:', err);
      setError('Failed to unblock product. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateCategory = async (product: TrustMartProduct, newCategory: string) => {
    try {
      setActionLoading(product.id);
      await AdminManagementService.updateProductCategory(product.id, newCategory);
      
      setUsersWithProducts(prev => prev.map(user => ({
        ...user,
        products: user.products.map(p => 
          p.id === product.id ? { ...p, category: newCategory } : p
        ),
      })));
      
      setActionDialog({ open: false, type: 'view', product: null, user: null });
      setNewCategory('');
      setError(null);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('Failed to update category. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteProduct = async (product: TrustMartProduct) => {
    try {
      setActionLoading(product.id);
      await AdminManagementService.deleteProduct(product.id);
      
      setUsersWithProducts(prev => prev.map(user => ({
        ...user,
        products: user.products.filter(p => p.id !== product.id),
        totalProducts: user.id === product.userId ? user.totalProducts - 1 : user.totalProducts,
        activeProducts: user.id === product.userId ? 
          user.products.filter(p => p.id !== product.id && p.status === 'Active').length :
          user.activeProducts,
        soldProducts: user.id === product.userId ? 
          user.products.filter(p => p.id !== product.id && p.status === 'Sold').length :
          user.soldProducts,
        inactiveProducts: user.id === product.userId ? 
          user.products.filter(p => p.id !== product.id && p.status === 'Inactive').length :
          user.inactiveProducts,
        blockedProducts: user.id === product.userId ? 
          user.products.filter(p => p.id !== product.id && p.status === 'Blocked').length :
          user.blockedProducts,
      })));
      
      setActionDialog({ open: false, type: 'view', product: null, user: null });
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, product: TrustMartProduct, user: TrustMartUser) => {
    setAnchorEl(event.currentTarget);
    setActionProduct(product);
    setActionUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionProduct(null);
    setActionUser(null);
  };

  const handleActionClick = (type: 'view' | 'edit' | 'delete' | 'block' | 'unblock' | 'category', product?: TrustMartProduct, user?: TrustMartUser) => {
    const targetProduct = product || actionProduct;
    const targetUser = user || actionUser;
    if (targetProduct && targetUser) {
      setActionDialog({ open: true, type, product: targetProduct, user: targetUser });
    }
    if (!product) {
      handleMenuClose();
    }
  };

  const handleDialogClose = () => {
    setActionDialog({ open: false, type: 'view', product: null, user: null });
    setNewCategory('');
  };

  const filteredUsers = usersWithProducts.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.isApproved) ||
                         (filterStatus === 'blocked' && !user.isApproved);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#E57373';
      case 'shop': return '#64B5F6';
      case 'user': return '#8BC34A';
      default: return '#8D6E63';
    }
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved ? '#8BC34A' : '#E57373';
  };

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? 'Active' : 'Blocked';
  };

  const getProductStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return '#8BC34A'; // Green
      case 'Sold':
        return '#2196F3'; // Blue
      case 'Inactive':
        return '#FF9800'; // Orange (owner-set inactive)
      case 'Blocked':
        return '#E57373'; // Red (admin-blocked)
      default:
        return '#E57373'; // Red
    }
  };

  const getProductStatusText = (status: string) => {
    switch (status) {
      case 'Active':
        return 'Active';
      case 'Sold':
        return 'Sold';
      case 'Inactive':
        return 'Inactive';
      case 'Blocked':
        return 'Blocked';
      default:
        return 'Unknown';
    }
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
      <Typography variant="h4" sx={{ mb: 3, color: '#5D4037', fontWeight: 700 }}>
        Product Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters and Search */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search users..."
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
              label="Role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="user">User</MenuItem>
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
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadUsersWithProducts}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Users and Products Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FEFCF8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Products</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <React.Fragment key={user.id}>
                  {/* User Row */}
                  <TableRow hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.profileImage}
                          sx={{ 
                            bgcolor: '#FFD5A1', 
                            width: 40, 
                            height: 40,
                            border: '2px solid #D4A574'
                          }}
                        >
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#5D4037' }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#8D6E63' }}>
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        size="small"
                        sx={{
                          bgcolor: getRoleColor(user.role),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(user.isApproved)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(user.isApproved),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Badge badgeContent={user.totalProducts} color="primary">
                          <Inventory sx={{ color: '#FFD5A1' }} />
                        </Badge>
                        <Box>
                          <Typography variant="body2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                            {user.activeProducts} Active
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#2196F3' }}>
                            {user.soldProducts} Sold
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#FF9800', display: 'block' }}>
                            {user.inactiveProducts} Inactive
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#E57373', display: 'block' }}>
                            {user.blockedProducts} Blocked
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: '#5D4037' }}>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View User Details">
                          <IconButton
                            size="small"
                            onClick={() => handleActionClick('view', undefined, user)}
                            sx={{ color: '#64B5F6' }}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={expandedUsers.has(user.id) ? "Collapse Products" : "Expand Products"}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleUserExpansion(user.id)}
                            sx={{ color: '#8D6E63' }}
                          >
                            <ExpandMore 
                              sx={{ 
                                transform: expandedUsers.has(user.id) ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                              }} 
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>

                  {/* Products Row - Collapsible */}
                  <TableRow>
                    <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                      <Collapse in={expandedUsers.has(user.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ bgcolor: '#FAFAFA', p: 2 }}>
                          <Typography variant="h6" sx={{ mb: 2, color: '#5D4037', fontWeight: 600 }}>
                            {user.name}'s Products ({user.totalProducts})
                          </Typography>
                          
                          {user.products.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <Inventory sx={{ fontSize: 48, color: '#8D6E63', mb: 2 }} />
                              <Typography variant="body1" sx={{ color: '#8D6E63' }}>
                                No products found
                              </Typography>
                            </Box>
                          ) : (
                            <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #E0E0E0' }}>
                              <Table size="small">
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#F5F5F5' }}>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Product Name</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Description</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Price</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Category</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Rating</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Actions</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {user.products.map((product) => (
                                    <TableRow 
                                      key={product.id}
                                      sx={{ 
                                        '&:hover': { bgcolor: '#FFF8E1' },
                                        '&:last-child td, &:last-child th': { border: 0 }
                                      }}
                                    >
                                      <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#5D4037' }}>
                                          {product.name}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Typography 
                                          variant="body2" 
                                          sx={{ 
                                            color: '#8D6E63',
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                          }}
                                        >
                                          {product.description}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <AttachMoney sx={{ color: '#8BC34A', fontSize: 16 }} />
                                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#5D4037' }}>
                                            ${product.price}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={product.category}
                                          size="small"
                                          sx={{ bgcolor: '#FFD5A1', color: '#5D4037' }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={getProductStatusText(product.status)}
                                          size="small"
                                          sx={{
                                            bgcolor: getProductStatusColor(product.status),
                                            color: 'white',
                                            fontWeight: 600,
                                          }}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Star sx={{ color: '#FFD5A1', fontSize: 16 }} />
                                          <Typography variant="body2" sx={{ color: '#5D4037' }}>
                                            {(product.averageRating || 0).toFixed(1)}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                          <Tooltip title="View Product">
                                            <IconButton
                                              size="small"
                                              onClick={() => handleActionClick('view', product, user)}
                                              sx={{ color: '#64B5F6' }}
                                            >
                                              <Visibility fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                          
                                          {(product.status === 'Active' || product.status === 'Inactive') ? (
                                            <Tooltip title="Block Product">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleBlockProduct(product)}
                                                disabled={actionLoading === product.id}
                                                sx={{ color: '#E57373' }}
                                              >
                                                {actionLoading === product.id ? (
                                                  <CircularProgress size={16} sx={{ color: '#E57373' }} />
                                                ) : (
                                                  <Block fontSize="small" />
                                                )}
                                              </IconButton>
                                            </Tooltip>
                                          ) : product.status === 'Blocked' ? (
                                            <Tooltip title="Unblock Product">
                                              <IconButton
                                                size="small"
                                                onClick={() => handleUnblockProduct(product)}
                                                disabled={actionLoading === product.id}
                                                sx={{ color: '#8BC34A' }}
                                              >
                                                {actionLoading === product.id ? (
                                                  <CircularProgress size={16} sx={{ color: '#8BC34A' }} />
                                                ) : (
                                                  <CheckCircle fontSize="small" />
                                                )}
                                              </IconButton>
                                            </Tooltip>
                                          ) : product.status === 'Sold' ? (
                                            <Tooltip title="Product is Sold - No actions available">
                                              <IconButton
                                                size="small"
                                                disabled
                                                sx={{ color: '#BDBDBD' }}
                                              >
                                                <CheckCircle fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          ) : null}

                                                                                    
                                          <Tooltip title="More Actions">
                                            <IconButton
                                              size="small"
                                              onClick={(e) => handleMenuClick(e, product, user)}
                                              sx={{ color: '#8D6E63' }}
                                            >
                                              <MoreVert fontSize="small" />
                                            </IconButton>
                                          </Tooltip>

                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
        <MenuItem onClick={() => handleActionClick('category')}>
          <ListItemIcon>
            <Category />
          </ListItemIcon>
          <ListItemText>Change Category</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleActionClick('delete')} sx={{ color: '#E57373' }}>
          <ListItemIcon>
            <Delete sx={{ color: '#E57373' }} />
          </ListItemIcon>
          <ListItemText>Delete Product</ListItemText>
        </MenuItem>
      </Menu>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: '#5D4037', fontWeight: 600 }}>
          {actionDialog.type === 'view' && 'Product Details'}
          {actionDialog.type === 'delete' && 'Delete Product'}
          {actionDialog.type === 'block' && 'Block Product'}
          {actionDialog.type === 'unblock' && 'Unblock Product'}
          {actionDialog.type === 'category' && 'Change Category'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.product && actionDialog.user && (
            <Box>
              {actionDialog.type === 'view' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ImageIcon sx={{ color: '#FFD5A1', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        {actionDialog.product.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        by {actionDialog.user.name}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Price
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#8BC34A', fontWeight: 600 }}>
                        ${actionDialog.product.price}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Category
                      </Typography>
                      <Chip
                        label={actionDialog.product.category}
                        size="small"
                        sx={{ bgcolor: '#FFD5A1', color: '#5D4037' }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Status
                      </Typography>
                      <Chip
                        label={getProductStatusText(actionDialog.product.status)}
                        size="small"
                        sx={{
                          bgcolor: getProductStatusColor(actionDialog.product.status),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Rating
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ color: '#FFD5A1', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#5D4037' }}>
                          {(actionDialog.product.averageRating || 0).toFixed(1)} ({actionDialog.product.totalReviews} reviews)
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                      Description
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                      {actionDialog.product.description}
                    </Typography>
                  </Box>
                </Box>
              )}

              {actionDialog.type === 'category' && (
                <Box>
                  <Typography variant="body1" sx={{ color: '#5D4037', mb: 2 }}>
                    Change category for <strong>{actionDialog.product.name}</strong>
                  </Typography>
                  <TextField
                    fullWidth
                    label="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter new category"
                  />
                </Box>
              )}

              {actionDialog.type === 'delete' && (
                <Typography variant="body1" sx={{ color: '#5D4037' }}>
                  Are you sure you want to delete <strong>{actionDialog.product.name}</strong>? 
                  This action cannot be undone.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ color: '#8D6E63' }}>
            Cancel
          </Button>
          {actionDialog.type === 'category' && (
            <Button
              onClick={() => actionDialog.product && handleUpdateCategory(actionDialog.product, newCategory)}
              variant="contained"
              disabled={!newCategory.trim() || actionLoading === actionDialog.product?.id}
              sx={{
                bgcolor: '#FFD5A1',
                color: '#5D4037',
                '&:hover': { bgcolor: '#E6C085' }
              }}
            >
              {actionLoading === actionDialog.product?.id ? (
                <CircularProgress size={16} sx={{ color: '#5D4037' }} />
              ) : (
                'Update Category'
              )}
            </Button>
          )}
          {actionDialog.type === 'delete' && (
            <Button
              onClick={() => actionDialog.product && handleDeleteProduct(actionDialog.product)}
              variant="contained"
              disabled={actionLoading === actionDialog.product?.id}
              sx={{
                bgcolor: '#E57373',
                '&:hover': { bgcolor: '#D32F2F' },
              }}
            >
              {actionLoading === actionDialog.product?.id ? (
                <CircularProgress size={16} sx={{ color: 'white' }} />
              ) : (
                'Delete Product'
              )}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductManagement;
