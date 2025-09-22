import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Divider,
  Link,
  Fade,
  Slide,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  ArrowBack,
  Email,
  Lock,
} from '@mui/icons-material';
import { AdminAuthService } from '../services/adminAuthService';

const SignInPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });


  // Initialize default admin on component mount
  useEffect(() => {
    AdminAuthService.initializeDefaultAdmin();
  }, []);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    
    // Basic validation
    const newErrors: { [key: string]: string } = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate with Firebase
      const admin = await AdminAuthService.authenticateAdmin(formData.email, formData.password);
      
      if (admin) {
        // Store admin data in localStorage for session management
        localStorage.setItem('adminUser', JSON.stringify({
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          loginTime: new Date().toISOString()
        }));

        setSnackbar({
          open: true,
          message: `Welcome back, ${admin.name || admin.email}!`,
          severity: 'success'
        });

        // Navigate to admin dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1000);
      } else {
        setSnackbar({
          open: true,
          message: 'Invalid email or password. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred during login. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLanding = () => {
    window.location.href = '/';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `
        radial-gradient(circle at 20% 80%, rgba(255, 213, 161, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(212, 165, 116, 0.1) 0%, transparent 50%),
        linear-gradient(135deg, #FEFCF8 0%, #FFF8F0 50%, #FEFCF8 100%)
      `,
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(2px 2px at 20px 30px, rgba(255, 213, 161, 0.15), transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(212, 165, 116, 0.15), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(139, 195, 74, 0.15), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(100, 181, 246, 0.15), transparent)
          `,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 100px',
          animation: 'float 20s linear infinite',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Back Button */}
        <Fade in timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBackToLanding}
              sx={{
                color: '#5D4037',
                '&:hover': {
                  backgroundColor: 'rgba(255, 213, 161, 0.1)',
                },
              }}
            >
              Back to Home
            </Button>
          </Box>
        </Fade>

        {/* Main Sign In Card */}
        <Slide direction="up" in timeout={1000}>
          <Card
            sx={{
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 213, 161, 0.3)',
              boxShadow: '0 20px 60px rgba(93, 64, 55, 0.15)',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 6 }}>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#FFD5A1',
                    mx: 'auto',
                    mb: 3,
                    boxShadow: '0 8px 32px rgba(255, 213, 161, 0.4)',
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 40, color: '#5D4037' }} />
                </Avatar>
                
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#5D4037', mb: 1 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body1" sx={{ color: '#8D6E63' }}>
                  Sign in to your TrustMart Admin Panel
                </Typography>
              </Box>

              {/* Sign In Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!errors.email}
                  helperText={errors.email}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '& fieldset': {
                        borderColor: 'rgba(255, 213, 161, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFD5A1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD5A1',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#FFD5A1',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: '#D4A574' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  error={!!errors.password}
                  helperText={errors.password}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      '& fieldset': {
                        borderColor: 'rgba(255, 213, 161, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#FFD5A1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#FFD5A1',
                      },
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#FFD5A1',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: '#D4A574' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: '#D4A574' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        sx={{
                          color: '#FFD5A1',
                          '&.Mui-checked': {
                            color: '#FFD5A1',
                          },
                        }}
                      />
                    }
                    label="Remember me"
                    sx={{ color: '#8D6E63' }}
                  />
                  <Link
                    href="#"
                    sx={{
                      color: '#D4A574',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading}
                  sx={{
                    background: 'linear-gradient(135deg, #FFD5A1 0%, #FFE4C4 100%)',
                    color: '#5D4037',
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(255, 213, 161, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(255, 213, 161, 0.6)',
                      background: 'linear-gradient(135deg, #E6C08F 0%, #FFD5A1 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 213, 161, 0.5)',
                      color: 'rgba(93, 64, 55, 0.5)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Box>

              <Divider sx={{ my: 3, borderColor: 'rgba(255, 213, 161, 0.3)' }}>
                <Typography variant="body2" sx={{ color: '#8D6E63', px: 2 }}>
                  or
                </Typography>
              </Divider>

              {/* Footer */}
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                  Don't have an account?{' '}
                  <Link
                    href="#"
                    sx={{
                      color: '#D4A574',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Contact Administrator
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Slide>

        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 213, 161, 0.2) 0%, rgba(212, 165, 116, 0.2) 100%)',
            animation: 'float 6s ease-in-out infinite',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            left: '5%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(139, 195, 74, 0.2) 0%, rgba(100, 181, 246, 0.2) 100%)',
            animation: 'float 8s ease-in-out infinite reverse',
            zIndex: 0,
          }}
        />
      </Container>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignInPage;
