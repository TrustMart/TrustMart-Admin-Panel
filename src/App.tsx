import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LandingScreen from './components/LandingScreen';
import AdminDashboard from './components/AdminDashboard';
import SignInPage from './components/SignInPage';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FFD5A1', // Warm Peach Primary
      light: '#FFE4C4',
      dark: '#E6C08F',
    },
    secondary: {
      main: '#D4A574', // Warm Brown Secondary
      light: '#E6C08F',
      dark: '#B8945F',
    },
    background: {
      default: '#FEFCF8', // Cream background
      paper: '#FFFFFF',
    },
    success: {
      main: '#8BC34A', // Soft Green
      light: '#AED581',
      dark: '#689F38',
    },
    warning: {
      main: '#FF9800', // Warm Orange
      light: '#FFB74D',
      dark: '#F57C00',
    },
    error: {
      main: '#E57373', // Soft Red
      light: '#FFAB91',
      dark: '#D32F2F',
    },
    info: {
      main: '#64B5F6', // Soft Blue
      light: '#90CAF9',
      dark: '#1976D2',
    },
    text: {
      primary: '#5D4037', // Warm Brown Text
      secondary: '#8D6E63', // Lighter Brown Text
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      color: '#5D4037',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      color: '#5D4037',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      color: '#5D4037',
    },
    h4: {
      fontWeight: 600,
      color: '#5D4037',
    },
    h5: {
      fontWeight: 600,
      color: '#5D4037',
    },
    h6: {
      fontWeight: 600,
      color: '#5D4037',
    },
    body1: {
      color: '#8D6E63',
      lineHeight: 1.6,
    },
    body2: {
      color: '#8D6E63',
      lineHeight: 1.5,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: '0 4px 20px rgba(255, 213, 161, 0.4)',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(255, 213, 161, 0.6)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            backgroundColor: 'rgba(255, 213, 161, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(93, 64, 55, 0.08)',
          border: '1px solid rgba(255, 213, 161, 0.2)',
          backgroundColor: '#FFFFFF',
          backdropFilter: 'blur(10px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<LandingScreen />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;