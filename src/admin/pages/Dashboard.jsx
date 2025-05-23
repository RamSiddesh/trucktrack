import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// NEW IMPORTS FOR LEAFLET ICONS
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for default marker icon issue with Vite/ESM
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// MUI components
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

// MUI icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';

// Map container style
const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

// Default center position (can be set to a central location in India)
const defaultCenter = {
  lat: 20.5937, // Central India latitude
  lng: 78.9629, // Central India longitude
};

const Dashboard = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [pendingDeliveries, setPendingDeliveries] = useState([]);
  const [completedToday, setCompletedToday] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for Leaflet map readiness (Leaflet loads synchronously)
  const [isMapReady, setIsMapReady] = useState(false); // Relies on MapContainer's whenCreated

  // Fetch data from Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    let initialVehiclesLoaded = false;
    let initialDriversLoaded = false;
    let initialDeliveriesLoaded = false;

    const checkAllLoaded = () => {
      if (initialVehiclesLoaded && initialDriversLoaded && initialDeliveriesLoaded) {
        setLoading(false);
      }
    };

    try {
      // Get vehicles with real-time updates
      const vehiclesQuery = collection(db, 'vehicles');
      const unsubscribeVehicles = onSnapshot(vehiclesQuery, (snapshot) => {
        const vehicleData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVehicles(vehicleData);

        if (vehicleData.length > 0 && vehicleData[0].currentLocation && !initialVehiclesLoaded) {
          setMapCenter({
            lat: vehicleData[0].currentLocation.latitude,
            lng: vehicleData[0].currentLocation.longitude,
          });
        }
        if (!initialVehiclesLoaded) {
          initialVehiclesLoaded = true;
          checkAllLoaded();
        }
      }, (err) => {
        console.error('Error fetching vehicles:', err);
        setError(prevError => prevError || 'Failed to load vehicle data');
        if (!initialVehiclesLoaded) {
            initialVehiclesLoaded = true; 
            checkAllLoaded();
        }
      });

      // Get drivers
      const driversQuery = query(collection(db, 'users'), where('role', '==', 'driver'));
      const unsubscribeDrivers = onSnapshot(driversQuery, (snapshot) => {
        const driverData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDrivers(driverData);
        if (!initialDriversLoaded) {
          initialDriversLoaded = true;
          checkAllLoaded();
        }
      }, (err) => {
        console.error('Error fetching drivers:', err);
        setError(prevError => prevError || 'Failed to load driver data');
        if (!initialDriversLoaded) {
            initialDriversLoaded = true;
            checkAllLoaded();
        }
      });

      // Get deliveries
      const deliveriesQuery = collection(db, 'deliveries');
      const unsubscribeDeliveries = onSnapshot(deliveriesQuery, (snapshot) => {
        const deliveryData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDeliveries(deliveryData);

        setActiveDeliveries(deliveryData.filter(d => d.status === 'in_progress'));
        setPendingDeliveries(deliveryData.filter(d => d.status === 'pending' || d.status === 'assigned'));
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        setCompletedToday(deliveryData.filter(d => {
          if (d.status !== 'completed') return false;
          const completedDate = d.timeline.find(t => t.status === 'completed')?.timestamp?.toDate();
          if (!completedDate) return false;
          return completedDate >= today;
        }));

        if (!initialDeliveriesLoaded) {
          initialDeliveriesLoaded = true;
          checkAllLoaded();
        }
      }, (err) => {
        console.error('Error fetching deliveries:', err);
        setError(prevError => prevError || 'Failed to load delivery data');
        if (!initialDeliveriesLoaded) {
            initialDeliveriesLoaded = true;
            checkAllLoaded();
        }
      });

      // Cleanup subscriptions
      return () => {
        unsubscribeVehicles();
        unsubscribeDrivers();
        unsubscribeDeliveries();
      };
    } catch (err) {
      console.error('Error setting up dashboard data listeners:', err);
      setError('Failed to set up data listeners');
      setLoading(false); // Fallback if initial setup fails
    }
  }, []);

  // Handle marker click
  const handleMarkerClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'on_delivery':
        return 'primary';
      case 'maintenance':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render map
  const renderMap = () => {
    // Custom icon logic for Leaflet
    const getVehicleIcon = (status) => {
      let iconUrl;
      switch (status) {
        case 'available':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';
          break;
        case 'on_delivery':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png';
          break;
        case 'maintenance':
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
          break;
        default:
          iconUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png';
      }
      return new L.Icon({
        iconUrl: iconUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
    };

    return (
      <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={10} style={mapContainerStyle} whenCreated={() => setIsMapReady(true)}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Render vehicle markers */}
        {vehicles.map((vehicle) => (
          vehicle.currentLocation && (
            <Marker
              key={vehicle.id}
              position={[
                vehicle.currentLocation.latitude,
                vehicle.currentLocation.longitude,
              ]}
              eventHandlers={{
                click: () => {
                  handleMarkerClick(vehicle);
                },
              }}
              icon={getVehicleIcon(vehicle.status)}
            >
              {/* Popup for selected vehicle - Leaflet's equivalent of InfoWindow */}
              {/* We will show popup only for the selected vehicle */}
            </Marker>
          )
        ))}

        {/* Popup for selected vehicle - shown when a marker is clicked */}
        {selectedVehicle && selectedVehicle.currentLocation && (
          <Popup
            position={[
              selectedVehicle.currentLocation.latitude,
              selectedVehicle.currentLocation.longitude,
            ]}
            onClose={() => setSelectedVehicle(null)} // This might need adjustment based on how react-leaflet handles Popup closing
          >
            <div>
              <Typography variant="subtitle1">{selectedVehicle.registrationNumber}</Typography>
              <Typography variant="body2">
                Type: {selectedVehicle.type}<br />
                Status: <Chip label={selectedVehicle.status} color={getStatusColor(selectedVehicle.status)} size="small" /><br />
                Driver: {drivers.find(d => d.id === selectedVehicle.assignedDriver)?.name || 'Unassigned'}
              </Typography>
            </div>
          </Popup>
        )}
      </MapContainer>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '200px', p: 3 }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          {t('admin.dashboard.loadingData', 'Loading dashboard data...')}
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px', p: 3 }}>
        <Alert severity="error" sx={{ width: '100%', maxWidth: '800px' }}>
          <Typography variant="h6" gutterBottom>
            {t('admin.dashboard.errorTitle', 'Error Loading Dashboard')}
          </Typography>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Map section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {t('admin.dashboard.title')}
            </Typography>
            {renderMap()}
          </Paper>
        </Grid>

        {/* Stats cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.dashboard.activeDeliveries')}
              </Typography>
              <Typography variant="h3">
                {activeDeliveries.length}
              </Typography>
              <LocalShippingIcon color="primary" sx={{ fontSize: 40, mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.dashboard.availableDrivers')}
              </Typography>
              <Typography variant="h3">
                {drivers.filter(d => d.status === 'available').length}
              </Typography>
              <PersonIcon color="success" sx={{ fontSize: 40, mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.dashboard.pendingDeliveries')}
              </Typography>
              <Typography variant="h3">
                {pendingDeliveries.length}
              </Typography>
              <PendingIcon color="warning" sx={{ fontSize: 40, mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('admin.dashboard.completedToday')}
              </Typography>
              <Typography variant="h3">
                {completedToday.length}
              </Typography>
              <CheckCircleIcon color="success" sx={{ fontSize: 40, mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Vehicle list */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Vehicles
            </Typography>
            <List>
              {vehicles.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No vehicles found" />
                </ListItem>
              ) : (
                vehicles.map((vehicle) => (
                  <div key={vehicle.id}>
                    <ListItem>
                      <ListItemText
                        primary={vehicle.registrationNumber}
                        secondary={`Type: ${vehicle.type} | Driver: ${drivers.find(d => d.id === vehicle.assignedDriver)?.name || 'Unassigned'}`}
                      />
                      <Chip
                        label={vehicle.status}
                        color={getStatusColor(vehicle.status)}
                        size="small"
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))
              )}
            </List>
          </Paper>
        </Grid>

        {/* Today's deliveries */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Today's Deliveries
            </Typography>
            <List>
              {activeDeliveries.length === 0 && pendingDeliveries.length === 0 ? (
                <ListItem>
                  <ListItemText primary="No active deliveries" />
                </ListItem>
              ) : (
                [...activeDeliveries, ...pendingDeliveries].slice(0, 5).map((delivery) => (
                  <div key={delivery.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${delivery.pickup.address} → ${delivery.dropoff.address}`}
                        secondary={`Driver: ${drivers.find(d => d.id === delivery.assignedDriver)?.name || 'Unassigned'}`}
                      />
                      <Chip
                        label={delivery.status}
                        color={delivery.status === 'in_progress' ? 'primary' : 'warning'}
                        size="small"
                      />
                    </ListItem>
                    <Divider />
                  </div>
                ))
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;