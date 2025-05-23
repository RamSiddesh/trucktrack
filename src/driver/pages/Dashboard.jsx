import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

// MUI components
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';

// MUI icons
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsIcon from '@mui/icons-material/Directions';
import StarIcon from '@mui/icons-material/Star';

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalDeliveries: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    inProgressDeliveries: 0,
    rating: 0,
  });
  const [upcomingDeliveries, setUpcomingDeliveries] = useState([]);

  useEffect(() => {
    const fetchDriverData = async () => {
      setLoading(true);
      try {
        // Get current user ID (in a real app, this would come from auth)
        const driverId = 'current-driver-id'; // Placeholder
        
        // Fetch deliveries assigned to this driver
        const deliveriesQuery = query(
          collection(db, 'deliveries'),
          where('driverId', '==', driverId)
        );
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const deliveries = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate statistics
        const completed = deliveries.filter(d => d.status === 'completed').length;
        const pending = deliveries.filter(d => d.status === 'pending').length;
        const inProgress = deliveries.filter(d => d.status === 'in_progress').length;
        
        setStats({
          totalDeliveries: deliveries.length,
          completedDeliveries: completed,
          pendingDeliveries: pending,
          inProgressDeliveries: inProgress,
          rating: 4.5, // Placeholder rating
        });
        
        // Get upcoming deliveries (pending or in progress, sorted by date)
        const upcoming = deliveries
          .filter(d => d.status === 'pending' || d.status === 'in_progress')
          .sort((a, b) => {
            const dateA = a.scheduledDate?.seconds || 0;
            const dateB = b.scheduledDate?.seconds || 0;
            return dateA - dateB;
          })
          .slice(0, 5); // Get only the next 5 deliveries
        
        setUpcomingDeliveries(upcoming);
        setError(null);
      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('driver.dashboard.total_deliveries')}
              </Typography>
              <Typography variant="h4">
                {stats.totalDeliveries}
              </Typography>
              <LocalShippingIcon color="primary" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('driver.dashboard.completed')}
              </Typography>
              <Typography variant="h4">
                {stats.completedDeliveries}
              </Typography>
              <CheckCircleIcon sx={{ color: 'success.main', mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('driver.dashboard.pending')}
              </Typography>
              <Typography variant="h4">
                {stats.pendingDeliveries}
              </Typography>
              <PendingIcon color="warning" sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                {t('driver.dashboard.rating')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="h4" sx={{ mr: 1 }}>
                  {stats.rating.toFixed(1)}
                </Typography>
                <StarIcon sx={{ color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Upcoming Deliveries */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('driver.dashboard.upcoming_deliveries')}
        </Typography>
        
        {upcomingDeliveries.length > 0 ? (
          <List>
            {upcomingDeliveries.map((delivery, index) => (
              <Box key={delivery.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>
                    {delivery.status === 'in_progress' ? 
                      <DirectionsIcon color="info" /> : 
                      <PendingIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={delivery.deliveryLocation}
                    secondary={`${t('delivery.scheduled_for')}: ${formatDate(delivery.scheduledDate)}`}
                  />
                  <Chip 
                    label={delivery.status === 'in_progress' ? 
                      t('delivery.status.in_progress') : 
                      t('delivery.status.pending')}
                    color={delivery.status === 'in_progress' ? 'info' : 'warning'}
                    size="small"
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            {t('driver.dashboard.no_upcoming_deliveries')}
          </Typography>
        )}
      </Paper>
      
      {/* Quick Tips */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('driver.dashboard.quick_tips')}
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary={t('driver.dashboard.tip_1')} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary={t('driver.dashboard.tip_2')} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary={t('driver.dashboard.tip_3')} />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Dashboard;