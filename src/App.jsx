import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { I18nextProvider } from 'react-i18next';
import i18n from './localization/i18n';
import { auth, db } from './firebase/config'; // Added db import
import { doc, getDoc } from 'firebase/firestore'; // Added Firestore imports
import { onAuthStateChanged } from 'firebase/auth';

// Admin components
import AdminLayout from './admin/components/AdminLayout';
import AdminDashboard from './admin/pages/Dashboard';
import DeliveryManagement from './admin/pages/DeliveryManagement';
import DriverManagement from './admin/pages/DriverManagement';
import DocumentManagement from './admin/pages/DocumentManagement';
import ReportingAnalytics from './admin/pages/ReportingAnalytics';

// Driver components
import DriverLayout from './driver/components/DriverLayout';
import DriverDashboard from './driver/pages/Dashboard';
import DeliveryTasks from './driver/pages/DeliveryTasks';
import Navigation from './driver/pages/Navigation';
import Communication from './driver/pages/Communication';
import Documentation from './driver/pages/Documentation';

// Common components
import Login from './common/pages/Login';
import Register from './common/pages/Register';
import NotFound from './common/pages/NotFound';
import OfflineIndicator from './common/components/OfflineIndicator';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Create theme based on dark mode preference
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in, now fetch their role from Firestore
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser({ ...currentUser, role: userDocSnap.data().role });
          } else {
            // User document doesn't exist, treat as no role or handle error
            setUser(currentUser); // Or setUser(null) to force login
            console.error("User document not found in Firestore");
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUser(currentUser); // Fallback or handle error appropriately
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <OfflineIndicator />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              user && user.role === 'admin' ? 
                <AdminLayout user={user} toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : 
                <Navigate to="/login" />
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="deliveries" element={<DeliveryManagement />} />
              <Route path="drivers" element={<DriverManagement />} />
              <Route path="documents" element={<DocumentManagement />} />
              <Route path="reports" element={<ReportingAnalytics />} />
            </Route>
            
            {/* Driver routes */}
            <Route path="/driver" element={
              user && user.role === 'driver' ? 
                <DriverLayout user={user} toggleDarkMode={toggleDarkMode} darkMode={darkMode} /> : 
                <Navigate to="/login" />
            }>
              <Route index element={<DriverDashboard />} />
              <Route path="tasks" element={<DeliveryTasks />} />
              <Route path="navigation" element={<Navigation />} />
              <Route path="messages" element={<Communication />} />
              <Route path="documents" element={<Documentation />} />
            </Route>
            
            {/* Redirect root to appropriate dashboard based on user role */}
            <Route path="/" element={
              !user ? <Navigate to="/login" /> :
              user.role === 'admin' ? <Navigate to="/admin" /> :
              user.role === 'driver' ? <Navigate to="/driver" /> :
              <Navigate to="/login" />
            } />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
