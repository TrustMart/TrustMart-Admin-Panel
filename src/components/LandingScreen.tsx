import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Avatar,
  Chip,
  Paper,
  useTheme,
  IconButton,
  Fade,
  Slide,
} from '@mui/material';
import MobileAccessModal from './MobileAccessModal';
import {
  ArrowForward,
  People,
  Store,
  Analytics,
  TrendingUp,
  Assessment,
  Storefront,
  Nature,
  Group,
  AdminPanelSettings,
  KeyboardArrowDown,
  PlayArrow,
  Pause,
} from '@mui/icons-material';

const LandingScreen: React.FC = () => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mobileModalOpen, setMobileModalOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: 'Rice Marketplace Management',
      description: 'Comprehensive oversight of rice products, categories, and agricultural inventory with advanced analytics',
      icon: <Store />,
      color: '#FFD5A1',
      gradient: 'linear-gradient(135deg, #FFD5A1 0%, #FFE4C4 100%)',
    },
    {
      title: 'Farmer Approval System',
      description: 'Streamlined approval process for rice farmers and agricultural suppliers with automated workflows',
      icon: <People />,
      color: '#D4A574',
      gradient: 'linear-gradient(135deg, #D4A574 0%, #E6C08F 100%)',
    },
    {
      title: 'Bidding Analytics',
      description: 'Real-time monitoring of rice bidding activities and market trends with predictive insights',
      icon: <Analytics />,
      color: '#8BC34A',
      gradient: 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)',
    },
    {
      title: 'Quality Control',
      description: 'Advanced quality assurance for rice products and agricultural standards with compliance tracking',
      icon: <Nature />,
      color: '#64B5F6',
      gradient: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)',
    },
  ];

  const stats = [
    { label: 'Rice Products', value: '12,847', icon: <Store />, color: '#FFD5A1', trend: '+15%' },
    { label: 'Active Farmers', value: '2,432', icon: <People />, color: '#D4A574', trend: '+8%' },
    { label: 'Rice Shops', value: '1,234', icon: <Storefront />, color: '#8BC34A', trend: '+12%' },
    { label: 'Total Revenue', value: '$2.4M', icon: <TrendingUp />, color: '#64B5F6', trend: '+23%' },
  ];

  const benefits = [
    { text: 'Real-time rice marketplace monitoring', icon: <Store /> },
    { text: 'Automated farmer approval workflows', icon: <People /> },
    { text: 'Advanced bidding analytics and insights', icon: <Assessment /> },
    { text: 'Quality control and compliance tracking', icon: <Nature /> },
    { text: 'Comprehensive farmer management', icon: <Group /> },
    { text: 'Market trend analysis and reporting', icon: <Analytics /> },
  ];

  const riceTypes = [
    { name: 'Basmati 1121', icon: '🌾', color: '#FFD5A1' },
    { name: 'Super Kainat', icon: '🌾', color: '#D4A574' },
    { name: 'Dhan 1509', icon: '🌾', color: '#8BC34A' },
    { name: 'Basmati 370', icon: '🌾', color: '#64B5F6' },
    { name: 'Basmati 385', icon: '🌾', color: '#FF9800' },
    { name: 'Dhan 1847', icon: '🌾', color: '#E57373' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentFeature((prev) => (prev + 1) % features.length);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isPlaying, features.length]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetStarted = () => {
    setMobileModalOpen(true);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        ref={heroRef}
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: `
            radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 213, 161, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #FEFCF8 0%, #FFF8F0 25%, #FFE4C4 50%, #FEFCF8 100%)
          `,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(255, 213, 161, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(212, 165, 116, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, rgba(139, 195, 74, 0.05) 0%, transparent 50%)
            `,
          },
        }}
      >
        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(2px 2px at 20px 30px, rgba(255, 213, 161, 0.2), transparent),
              radial-gradient(2px 2px at 40px 70px, rgba(212, 165, 116, 0.2), transparent),
              radial-gradient(1px 1px at 90px 40px, rgba(139, 195, 74, 0.2), transparent),
              radial-gradient(1px 1px at 130px 80px, rgba(100, 181, 246, 0.2), transparent),
              radial-gradient(2px 2px at 160px 30px, rgba(255, 213, 161, 0.2), transparent)
            `,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 100px',
            animation: 'float 20s linear infinite',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, alignItems: 'center' }}>
            <Box>
              <Fade in timeout={1000}>
                <Box>
                  {/* Logo/Brand */}
                  <Box sx={{ mb: 4 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: '#FFD5A1',
                        mb: 2,
                        boxShadow: '0 8px 32px rgba(255, 213, 161, 0.4)',
                      }}
                    >
                      <AdminPanelSettings sx={{ fontSize: 40, color: '#5D4037' }} />
                    </Avatar>
                  </Box>

                  <Typography
                    variant="h1"
                    component="h1"
                    sx={{
                      color: '#5D4037',
                      fontWeight: 800,
                      mb: 2,
                      fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                      lineHeight: 1.1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    TrustMart
                    <Typography
                      component="span"
                      sx={{
                        display: 'block',
                        fontSize: { xs: '1.2rem', md: '1.8rem', lg: '2.2rem' },
                        fontWeight: 600,
                        color: '#D4A574',
                        mt: 1,
                      }}
                    >
                      Admin Panel
                    </Typography>
                  </Typography>
                  
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#8D6E63',
                      mb: 4,
                      lineHeight: 1.6,
                      maxWidth: '500px',
                    }}
                  >
                    Manage your rice marketplace with powerful administration tools. 
                    Oversee farmers, products, bidding, and ensure quality in every grain.
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      sx={{
                        background: 'linear-gradient(135deg, #FFD5A1 0%, #FFE4C4 100%)',
                        color: '#5D4037',
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(255, 213, 161, 0.4)',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 40px rgba(255, 213, 161, 0.6)',
                          background: 'linear-gradient(135deg, #E6C08F 0%, #FFD5A1 100%)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      endIcon={<ArrowForward />}
                      onClick={() => window.location.href = '/signin'}
                    >
                      Access Dashboard
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        borderColor: '#D4A574',
                        color: '#5D4037',
                        px: 4,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        borderRadius: 3,
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          backgroundColor: 'rgba(212, 165, 116, 0.1)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                      startIcon={<PlayArrow />}
                    >
                      Watch Demo
                    </Button>
                  </Box>

                  {/* Rice Types Chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {riceTypes.map((rice, index) => (
                      <Chip
                        key={index}
                        label={rice.name}
                        size="small"
                        sx={{
                          bgcolor: rice.color,
                          color: '#5D4037',
                          fontWeight: 500,
                          '&:hover': {
                            bgcolor: rice.color,
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Fade>
            </Box>

            <Box>
              <Slide direction="left" in timeout={1200}>
                <Box sx={{ position: 'relative' }}>
                  {/* Feature Showcase */}
                  <Card
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 213, 161, 0.3)',
                      boxShadow: '0 20px 60px rgba(93, 64, 55, 0.1)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: features[currentFeature].color,
                          mr: 2,
                          width: 50,
                          height: 50,
                        }}
                      >
                        {features[currentFeature].icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#5D4037' }}>
                          {features[currentFeature].title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                          Feature {currentFeature + 1} of {features.length}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        <IconButton
                          onClick={() => setIsPlaying(!isPlaying)}
                          sx={{ color: '#D4A574' }}
                        >
                          {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Box>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: '#8D6E63',
                        lineHeight: 1.6,
                        mb: 3,
                      }}
                    >
                      {features[currentFeature].description}
                    </Typography>

                    {/* Progress Indicators */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {features.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor: index === currentFeature ? '#FFD5A1' : 'rgba(255, 213, 161, 0.3)',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Box>
                  </Card>

                  {/* Floating Stats */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -20,
                      right: -20,
                      bgcolor: '#8BC34A',
                      color: 'white',
                      borderRadius: 3,
                      p: 2,
                      boxShadow: '0 8px 32px rgba(139, 195, 74, 0.3)',
                      animation: 'float 3s ease-in-out infinite',
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      +23%
                    </Typography>
                    <Typography variant="caption">
                      Growth
                    </Typography>
                  </Box>
                </Box>
              </Slide>
            </Box>
          </Box>

          {/* Scroll Indicator */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              cursor: 'pointer',
            }}
            onClick={scrollToFeatures}
          >
            <KeyboardArrowDown sx={{ color: '#D4A574', fontSize: 40 }} />
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 12, position: 'relative' }}>
        <Typography
          variant="h2"
          component="h2"
          sx={{ 
            textAlign: 'center', 
            mb: 8, 
            fontWeight: 700,
            color: '#5D4037',
          }}
        >
          Rice Marketplace Overview
        </Typography>
        
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 4
        }}>
          {stats.map((stat, index) => (
            <Slide direction="up" in timeout={1000 + index * 200} key={index}>
              <Card
                sx={{
                  p: 4,
                  textAlign: 'center',
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 213, 161, 0.2)',
                  boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 20px 60px rgba(93, 64, 55, 0.15)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: stat.color,
                    color: '#5D4037',
                    width: 60,
                    height: 60,
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#5D4037' }}>
                  {stat.value}
                </Typography>
                <Typography variant="h6" sx={{ color: '#8D6E63', mb: 1 }}>
                  {stat.label}
                </Typography>
                <Chip
                  label={stat.trend}
                  size="small"
                  sx={{
                    bgcolor: '#8BC34A',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Card>
            </Slide>
          ))}
        </Box>
      </Container>

      {/* Features Section */}
      <Box
        id="features-section"
        sx={{
          py: 12,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 213, 161, 0.03) 0%, rgba(212, 165, 116, 0.03) 100%)',
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{ 
              textAlign: 'center', 
              mb: 8, 
              fontWeight: 700,
              color: '#5D4037',
            }}
          >
            Admin Capabilities
          </Typography>
          
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
            gap: 6
          }}>
            {features.map((feature, index) => (
              <Fade in timeout={1000 + index * 200} key={index}>
                <Card
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 213, 161, 0.2)',
                    boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 60px rgba(93, 64, 55, 0.15)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        color: '#5D4037',
                        width: 60,
                        height: 60,
                        mr: 3,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#5D4037' }}>
                        {feature.title}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body1" sx={{ color: '#8D6E63', lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Fade>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 8,
          alignItems: 'center'
        }}>
          <Box>
            <Typography
              variant="h2"
              component="h2"
              sx={{ 
                mb: 4, 
                fontWeight: 700,
                color: '#5D4037',
              }}
            >
              Why Choose Our Platform?
            </Typography>
            
            <Box sx={{ mb: 6 }}>
              {benefits.map((benefit, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'rgba(255, 213, 161, 0.2)',
                      color: '#FFD5A1',
                      width: 40,
                      height: 40,
                      mr: 3,
                    }}
                  >
                    {benefit.icon}
                  </Avatar>
                  <Typography variant="body1" sx={{ color: '#8D6E63', fontSize: '1.1rem' }}>
                    {benefit.text}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #FFD5A1 0%, #FFE4C4 100%)',
                color: '#5D4037',
                px: 4,
                py: 2,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(255, 213, 161, 0.4)',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 40px rgba(255, 213, 161, 0.6)',
                  background: 'linear-gradient(135deg, #E6C08F 0%, #FFD5A1 100%)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              endIcon={<ArrowForward />}
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
          </Box>

          <Box>
            <Paper
              sx={{
                p: 6,
                borderRadius: 4,
                background: 'linear-gradient(135deg, #FFD5A1 0%, #FFE4C4 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 100, mb: 3, color: '#5D4037' }} />
              <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#5D4037' }}>
                Ready to Manage?
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, color: '#8D6E63', lineHeight: 1.6 }}>
                Join thousands of administrators who trust our platform for their rice marketplace management needs.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: '#5D4037',
                  color: '#5D4037',
                  px: 4,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    backgroundColor: 'rgba(93, 64, 55, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                endIcon={<ArrowForward />}
                onClick={() => window.location.href = '/signin'}
              >
                Access Dashboard
              </Button>
            </Paper>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#FFD5A1',
          color: '#5D4037',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
            © 2024 TrustMart Rice Marketplace Admin Panel. All rights reserved.
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Built with ❤️ for the agricultural community
          </Typography>
        </Container>
      </Box>

      {/* Mobile Access Modal */}
      <MobileAccessModal
        open={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
      />
    </Box>
  );
};

export default LandingScreen;