import React from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Card,
  SlideProps,
} from '@mui/material';
import {
  Close,
  PhoneAndroid,
  Apple,
  QrCode,
  Store,
  Security,
  Speed,
  CheckCircle,
} from '@mui/icons-material';

interface MobileAccessModalProps {
  open: boolean;
  onClose: () => void;
}

const MobileAccessModal: React.FC<MobileAccessModalProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    { icon: <Store />, text: 'Full marketplace access', color: '#FFD5A1' },
    { icon: <Security />, text: 'Secure transactions', color: '#D4A574' },
    { icon: <Speed />, text: 'Real-time updates', color: '#8BC34A' },
  ];

  const handleDownload = (platform: 'android' | 'ios') => {
    // Simulate download action
    console.log(`Downloading for ${platform}`);
    // In real app, this would redirect to app store or download page
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 4,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 213, 161, 0.3)',
          boxShadow: '0 20px 60px rgba(93, 64, 55, 0.15)',
          overflow: 'hidden',
        },
      }}
      TransitionComponent={Slide}
      TransitionProps={{ direction: 'up' } as SlideProps}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(255, 213, 161, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(212, 165, 116, 0.05) 0%, transparent 50%)
            `,
            zIndex: 0,
          }}
        />

        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 1,
            color: '#5D4037',
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              bgcolor: 'rgba(255, 213, 161, 0.2)',
            },
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #FFD5A1 0%, #FFE4C4 100%)',
              p: 4,
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'float 6s ease-in-out infinite',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                animation: 'float 8s ease-in-out infinite reverse',
              }}
            />

            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: '#5D4037',
                mx: 'auto',
                mb: 2,
                boxShadow: '0 8px 32px rgba(93, 64, 55, 0.3)',
              }}
            >
              <PhoneAndroid sx={{ fontSize: 40, color: '#FFD5A1' }} />
            </Avatar>

            <Typography variant="h4" sx={{ fontWeight: 800, color: '#5D4037', mb: 1 }}>
              Access on Mobile
            </Typography>
            <Typography variant="body1" sx={{ color: '#8D6E63', maxWidth: '400px', mx: 'auto' }}>
              Get the full TrustMart experience on your mobile device with our native app
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ p: 4 }}>
            {/* Features */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#5D4037', mb: 3, textAlign: 'center' }}>
                Why Use Our Mobile App?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {features.map((feature, index) => (
                  <Fade in timeout={800 + index * 200} key={index}>
                    <Card
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        background: 'rgba(255, 255, 255, 0.8)',
                        border: '1px solid rgba(255, 213, 161, 0.2)',
                        boxShadow: '0 4px 20px rgba(93, 64, 55, 0.08)',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 30px rgba(93, 64, 55, 0.15)',
                        },
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: feature.color,
                            color: '#5D4037',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {feature.icon}
                        </Avatar>
                        <Typography variant="body1" sx={{ color: '#5D4037', fontWeight: 500 }}>
                          {feature.text}
                        </Typography>
                        <CheckCircle sx={{ color: '#8BC34A', ml: 'auto' }} />
                      </Box>
                    </Card>
                  </Fade>
                ))}
              </Box>
            </Box>

            {/* Download Buttons */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#5D4037', mb: 3, textAlign: 'center' }}>
                Download Now
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<PhoneAndroid />}
                  onClick={() => handleDownload('android')}
                  sx={{
                    background: 'linear-gradient(135deg, #8BC34A 0%, #AED581 100%)',
                    color: 'white',
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(139, 195, 74, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(139, 195, 74, 0.6)',
                      background: 'linear-gradient(135deg, #689F38 0%, #8BC34A 100%)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Download for Android
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<Apple />}
                  onClick={() => handleDownload('ios')}
                  sx={{
                    background: 'linear-gradient(135deg, #64B5F6 0%, #90CAF9 100%)',
                    color: 'white',
                    py: 2,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(100, 181, 246, 0.4)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(100, 181, 246, 0.6)',
                      background: 'linear-gradient(135deg, #1976D2 0%, #64B5F6 100%)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Download for iOS
                </Button>
              </Box>
            </Box>

            {/* QR Code Section */}
            <Card
              sx={{
                p: 3,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.8)',
                border: '1px solid rgba(255, 213, 161, 0.2)',
                borderRadius: 3,
                mb: 3,
              }}
            >
              <QrCode sx={{ fontSize: 60, color: '#5D4037', mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#5D4037', mb: 1 }}>
                Scan to Download
              </Typography>
              <Typography variant="body2" sx={{ color: '#8D6E63' }}>
                Use your phone's camera to scan this QR code for quick access
              </Typography>
            </Card>

            {/* Alternative Access */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#8D6E63', mb: 2 }}>
                Prefer to continue on web?
              </Typography>
              <Button
                variant="outlined"
                onClick={onClose}
                sx={{
                  borderColor: '#D4A574',
                  color: '#5D4037',
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  borderWidth: '2px',
                  '&:hover': {
                    borderWidth: '2px',
                    backgroundColor: 'rgba(212, 165, 116, 0.1)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Continue on Web
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MobileAccessModal;
