import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// MUI components
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';

// MUI icons
import MyLocationIcon from '@mui/icons-material/MyLocation';
import NavigationIcon from '@mui/icons-material/Navigation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DirectionsIcon from '@mui/icons-material/Directions';
import SearchIcon from '@mui/icons-material/Search';

const Navigation = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  
  // Simulated map state (in a real app, this would use a mapping library like Google Maps)
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Fetch current delivery and recent locations
  useEffect(() => {
    const fetchNavigationData = async () => {
      setLoading(true);
      try {
        // Get current user ID (in a real app, this would come from auth)
        const driverId = 'current-driver-id'; // Placeholder
        
        // Fetch in-progress deliveries assigned to this driver
        const deliveriesQuery = query(
          collection(db, 'deliveries'),
          where('driverId', '==', driverId),
          where('status', '==', 'in_progress')
        );
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const inProgressDeliveries = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Set current delivery (first in-progress delivery)
        if (inProgressDeliveries.length > 0) {
          setCurrentDelivery(inProgressDeliveries[0]);
        }
        
        // Fetch recent locations (in a real app, this would be from a locations collection)
        // Simulated data for demonstration
        setRecentLocations([
          { id: '1', name: 'Distribution Center', address: '123 Warehouse St, City' },
          { id: '2', name: 'Shopping Mall', address: '456 Retail Ave, City' },
          { id: '3', name: 'Business Park', address: '789 Office Blvd, City' },
        ]);
        
        // Simulate map loading
        setTimeout(() => {
          setMapLoaded(true);
        }, 1000);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching navigation data:', err);
        setError('Failed to load navigation data');
      } finally {
        setLoading(false);
      }
    };

    fetchNavigationData();
  }, []);

  // Handle search
  const handleSearch = () => {
    // In a real app, this would search for locations using a maps API
    console.log('Searching for:', searchQuery);
  };

  // Get directions to a location
  const getDirections = (location) => {
    // In a real app, this would use a maps API to get directions
    console.log('Getting directions to:', location);
  };

  // Get current location
  const getCurrentLocation = () => {
    // In a real app, this would use the browser's geolocation API
    console.log('Getting current location');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
        <TextField
          fullWidth
          placeholder={t('driver.navigation.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          size="small"
        />
        <IconButton onClick={handleSearch} sx={{ ml: 1 }}>
          <SearchIcon />
        </IconButton>
        <IconButton onClick={getCurrentLocation} sx={{ ml: 1 }}>
          <MyLocationIcon />
        </IconButton>
      </Paper>
      
      {/* Map Area (Simulated) */}
      <Paper 
        sx={{ 
          height: 300, 
          mb: 3, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          bgcolor: '#e0e0e0',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {!mapLoaded ? (
          <CircularProgress />
        ) : (
          <>
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                bgcolor: '#cfd8dc',
                backgroundImage: 'linear-gradient(90deg, #bdbdbd 1px, transparent 1px), linear-gradient(#bdbdbd 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }} 
            />
            <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
              <Paper sx={{ p: 1 }}>
                <IconButton size="small">
                  <MyLocationIcon fontSize="small" />
                </IconButton>
                <IconButton size="small">
                  <NavigationIcon fontSize="small" />
                </IconButton>
              </Paper>
            </Box>
            {currentDelivery && (
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: '50%', 
                  left: '50%', 
                  transform: 'translate(-50%, 50%)',
                  zIndex: 5
                }}
              >
                <LocationOnIcon color="error" sx={{ fontSize: 40 }} />
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Current Delivery */}
      {currentDelivery && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('driver.navigation.current_delivery')}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>{t('delivery.delivery_location')}:</strong> {currentDelivery.deliveryLocation}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              {currentDelivery.customer?.name} • {currentDelivery.customer?.phone}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<DirectionsIcon />}
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => getDirections(currentDelivery.deliveryLocation)}
            >
              {t('driver.navigation.get_directions')}
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Recent Locations */}
      <Paper>
        <List subheader={
          <Box sx={{ p: 2, pb: 0 }}>
            <Typography variant="h6">
              {t('driver.navigation.recent_locations')}
            </Typography>
          </Box>
        }>
          {recentLocations.map((location, index) => (
            <Box key={location.id}>
              {index > 0 && <Divider />}
              <ListItem>
                <ListItemIcon>
                  <LocationOnIcon />
                </ListItemIcon>
                <ListItemText
                  primary={location.name}
                  secondary={location.address}
                />
                <IconButton edge="end" onClick={() => getDirections(location.address)}>
                  <DirectionsIcon />
                </IconButton>
              </ListItem>
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Navigation;