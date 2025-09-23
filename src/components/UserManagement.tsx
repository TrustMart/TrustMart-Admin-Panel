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
  Block,
  CheckCircle,
  MoreVert,
  Person,
  Star,
  Refresh,
  Visibility,
  Edit,
  Delete,
  Store,
  Business,
  SupervisorAccount,
} from '@mui/icons-material';
import { AdminManagementService, TrustMartUser } from '../services/adminManagementService';

interface UserManagementProps {}

const UserManagement: React.FC<UserManagementProps> = () => {
  const [users, setUsers] = useState<TrustMartUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    type: 'block' | 'unblock' | 'view' | 'edit' | 'delete';
    user: TrustMartUser | null;
  }>({
    open: false,
    type: 'view',
    user: null,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionUser, setActionUser] = useState<TrustMartUser | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await AdminManagementService.getUsers(1000); // Get more users for better management
      setUsers(result.users);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleBlockUser = async (user: TrustMartUser) => {
    try {
      setActionLoading(user.id);
      await AdminManagementService.updateUserApproval(user.id, false);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isApproved: false } : u
      ));
      setActionDialog({ open: false, type: 'view', user: null });
      setError(null);
    } catch (err) {
      console.error('Error blocking user:', err);
      setError('Failed to block user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async (user: TrustMartUser) => {
    try {
      setActionLoading(user.id);
      await AdminManagementService.updateUserApproval(user.id, true);
      setUsers(prev => prev.map(u => 
        u.id === user.id ? { ...u, isApproved: true } : u
      ));
      setActionDialog({ open: false, type: 'view', user: null });
      setError(null);
    } catch (err) {
      console.error('Error unblocking user:', err);
      setError('Failed to unblock user. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (user: TrustMartUser) => {
    try {
      await AdminManagementService.deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setActionDialog({ open: false, type: 'view', user: null });
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, user: TrustMartUser) => {
    setAnchorEl(event.currentTarget);
    setActionUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActionUser(null);
  };

  const handleActionClick = (type: 'block' | 'unblock' | 'view' | 'edit' | 'delete', user?: TrustMartUser) => {
    const targetUser = user || actionUser;
    if (targetUser) {
      setActionDialog({ open: true, type, user: targetUser });
    }
    if (!user) {
      handleMenuClose();
    }
  };

  const handleDialogClose = () => {
    setActionDialog({ open: false, type: 'view', user: null });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'approved' && user.isApproved) ||
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
      case 'user': return '#8BC34A';      // Green for regular users
      case 'shop': return '#64B5F6';     // Blue for shop owners
      case 'company': return '#FF9800';  // Orange for companies
      case 'commissioner': return '#9C27B0'; // Purple for commissioners
      default: return '#8D6E63';         // Brown for unknown roles
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'user': return <Person fontSize="small" />;
      case 'shop': return <Store fontSize="small" />;
      case 'company': return <Business fontSize="small" />;
      case 'commissioner': return <SupervisorAccount fontSize="small" />;
      default: return <Person fontSize="small" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'user': return 'User';
      case 'shop': return 'Shop Owner';
      case 'company': return 'Company';
      case 'commissioner': return 'Commissioner';
      default: return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getStatusColor = (isApproved: boolean) => {
    return isApproved ? '#8BC34A' : '#E57373';
  };

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? 'Active' : 'Blocked';
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
        User Management
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
              <MenuItem value="approved">Active</MenuItem>
              <MenuItem value="blocked">Blocked</MenuItem>
            </TextField>

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadUsers}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#FEFCF8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>User</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Rating</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#5D4037' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
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
                      icon={getRoleIcon(user.role)}
                      label={getRoleDisplayName(user.role)}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Star sx={{ color: '#FFD5A1', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ color: '#5D4037' }}>
                        {user.averageRating.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#8D6E63' }}>
                        ({user.totalReviews})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#5D4037' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            console.log('View button clicked for user:', user);
                            handleActionClick('view', user);
                          }}
                          sx={{ color: '#64B5F6' }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      
                      {user.isApproved ? (
                        <Tooltip title="Block User">
                          <IconButton
                            size="small"
                            onClick={() => handleBlockUser(user)}
                            disabled={actionLoading === user.id}
                            sx={{ color: '#E57373' }}
                          >
                            {actionLoading === user.id ? (
                              <CircularProgress size={16} sx={{ color: '#E57373' }} />
                            ) : (
                              <Block />
                            )}
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Unblock User">
                          <IconButton
                            size="small"
                            onClick={() => handleUnblockUser(user)}
                            disabled={actionLoading === user.id}
                            sx={{ color: '#8BC34A' }}
                          >
                            {actionLoading === user.id ? (
                              <CircularProgress size={16} sx={{ color: '#8BC34A' }} />
                            ) : (
                              <CheckCircle />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}

                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuClick(e, user)}
                        sx={{ color: '#8D6E63' }}
                      >
                        <MoreVert />
                      </IconButton>
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
          <ListItemText>Delete User</ListItemText>
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
          {actionDialog.type === 'view' && 'User Details'}
          {actionDialog.type === 'block' && 'Block User'}
          {actionDialog.type === 'unblock' && 'Unblock User'}
          {actionDialog.type === 'delete' && 'Delete User'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.user && (
            <Box>
              {actionDialog.type === 'view' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      src={actionDialog.user.profileImage}
                      sx={{ 
                        bgcolor: '#FFD5A1', 
                        width: 60, 
                        height: 60,
                        border: '2px solid #D4A574'
                      }}
                    >
                      <Person />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        {actionDialog.user.name}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        {actionDialog.user.email}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Role
                      </Typography>
                      <Chip
                        icon={getRoleIcon(actionDialog.user.role)}
                        label={getRoleDisplayName(actionDialog.user.role)}
                        size="small"
                        sx={{
                          bgcolor: getRoleColor(actionDialog.user.role),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Status
                      </Typography>
                      <Chip
                        label={getStatusText(actionDialog.user.isApproved)}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(actionDialog.user.isApproved),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Phone
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        {actionDialog.user.phone || 'Not provided'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Rating
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Star sx={{ color: '#FFD5A1', fontSize: 16 }} />
                        <Typography variant="body2" sx={{ color: '#5D4037' }}>
                          {actionDialog.user.averageRating.toFixed(1)} ({actionDialog.user.totalReviews} reviews)
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Joined
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        {new Date(actionDialog.user.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Last Updated
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        {new Date(actionDialog.user.updatedAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {actionDialog.user.address && (
                    <Box>
                      <Typography variant="subtitle2" sx={{ color: '#5D4037', fontWeight: 600 }}>
                        Address
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                        {actionDialog.user.address}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {actionDialog.type === 'block' && (
                <Typography variant="body1" sx={{ color: '#5D4037' }}>
                  Are you sure you want to block <strong>{actionDialog.user.name}</strong>? 
                  This will prevent them from accessing the platform.
                </Typography>
              )}

              {actionDialog.type === 'unblock' && (
                <Typography variant="body1" sx={{ color: '#5D4037' }}>
                  Are you sure you want to unblock <strong>{actionDialog.user.name}</strong>? 
                  This will restore their access to the platform.
                </Typography>
              )}

              {actionDialog.type === 'delete' && (
                <Typography variant="body1" sx={{ color: '#5D4037' }}>
                  Are you sure you want to delete <strong>{actionDialog.user.name}</strong>? 
                  This action cannot be undone and will permanently remove the user and all their data.
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ color: '#8D6E63' }}>
            Cancel
          </Button>
          {actionDialog.type === 'block' && (
            <Button
              onClick={() => actionDialog.user && handleBlockUser(actionDialog.user)}
              variant="contained"
              sx={{
                bgcolor: '#E57373',
                '&:hover': { bgcolor: '#D32F2F' },
              }}
            >
              Block User
            </Button>
          )}
          {actionDialog.type === 'unblock' && (
            <Button
              onClick={() => actionDialog.user && handleUnblockUser(actionDialog.user)}
              variant="contained"
              sx={{
                bgcolor: '#8BC34A',
                '&:hover': { bgcolor: '#689F38' },
              }}
            >
              Unblock User
            </Button>
          )}
          {actionDialog.type === 'delete' && (
            <Button
              onClick={() => actionDialog.user && handleDeleteUser(actionDialog.user)}
              variant="contained"
              sx={{
                bgcolor: '#E57373',
                '&:hover': { bgcolor: '#D32F2F' },
              }}
            >
              Delete User
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
