import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// MUI components
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';

// MUI icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingIcon from '@mui/icons-material/Pending';
import InfoIcon from '@mui/icons-material/Info';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const DeliveryTasks = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [notes, setNotes] = useState('');

  // Fetch deliveries from Firestore
  useEffect(() => {
    const fetchDeliveries = async () => {
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
        const deliveriesData = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDeliveries(deliveriesData);
        filterDeliveries(deliveriesData, tabValue);
        setError(null);
      } catch (err) {
        console.error('Error fetching deliveries:', err);
        setError('Failed to load deliveries');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Filter deliveries based on tab selection
  const filterDeliveries = (allDeliveries, tabIndex) => {
    switch (tabIndex) {
      case 0: // All
        setFilteredDeliveries(allDeliveries);
        break;
      case 1: // Pending
        setFilteredDeliveries(allDeliveries.filter(d => d.status === 'pending'));
        break;
      case 2: // In Progress
        setFilteredDeliveries(allDeliveries.filter(d => d.status === 'in_progress'));
        break;
      case 3: // Completed
        setFilteredDeliveries(allDeliveries.filter(d => d.status === 'completed'));
        break;
      default:
        setFilteredDeliveries(allDeliveries);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    filterDeliveries(deliveries, newValue);
  };

  // Open delivery details dialog
  const handleOpenDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setOpenDetailsDialog(true);
  };

  // Open complete delivery dialog
  const handleOpenComplete = (delivery) => {
    setSelectedDelivery(delivery);
    setNotes('');
    setOpenCompleteDialog(true);
  };

  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenDetailsDialog(false);
    setOpenCompleteDialog(false);
    setSelectedDelivery(null);
  };

  // Start delivery (change status to in_progress)
  const handleStartDelivery = async (deliveryId) => {
    try {
      const deliveryRef = doc(db, 'deliveries', deliveryId);
      await updateDoc(deliveryRef, {
        status: 'in_progress',
        startTime: new Date(),
        updatedAt: new Date()
      });
      
      // Update local state
      const updatedDeliveries = deliveries.map(d => {
        if (d.id === deliveryId) {
          return { ...d, status: 'in_progress', startTime: new Date() };
        }
        return d;
      });
      
      setDeliveries(updatedDeliveries);
      filterDeliveries(updatedDeliveries, tabValue);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error starting delivery:', err);
      setError('Failed to start delivery');
    }
  };

  // Complete delivery
  const handleCompleteDelivery = async () => {
    if (!selectedDelivery) return;
    
    try {
      const deliveryRef = doc(db, 'deliveries', selectedDelivery.id);
      await updateDoc(deliveryRef, {
        status: 'completed',
        completionTime: new Date(),
        notes: notes,
        updatedAt: new Date()
      });
      
      // Update local state
      const updatedDeliveries = deliveries.map(d => {
        if (d.id === selectedDelivery.id) {
          return { 
            ...d, 
            status: 'completed', 
            completionTime: new Date(),
            notes: notes 
          };
        }
        return d;
      });
      
      setDeliveries(updatedDeliveries);
      filterDeliveries(updatedDeliveries, tabValue);
      handleCloseDialogs();
    } catch (err) {
      console.error('Error completing delivery:', err);
      setError('Failed to complete delivery');
    }
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get status chip based on delivery status
  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<PendingIcon />} label={t('delivery.status.pending')} color="warning" size="small" />;
      case 'in_progress':
        return <Chip icon={<LocalShippingIcon />} label={t('delivery.status.in_progress')} color="info" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircleIcon />} label={t('delivery.status.completed')} color="success" size="small" />;
      case 'cancelled':
        return <Chip label={t('delivery.status.cancelled')} color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
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
      
      {/* Tabs for filtering */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={t('driver.tasks.all')} />
          <Tab label={t('driver.tasks.pending')} />
          <Tab label={t('driver.tasks.in_progress')} />
          <Tab label={t('driver.tasks.completed')} />
        </Tabs>
      </Paper>
      
      {/* Deliveries list */}
      <Paper>
        {filteredDeliveries.length > 0 ? (
          <List>
            {filteredDeliveries.map((delivery, index) => (
              <Box key={delivery.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>
                    {delivery.status === 'completed' ? 
                      <CheckCircleIcon color="success" /> : 
                      delivery.status === 'in_progress' ? 
                        <LocalShippingIcon color="info" /> : 
                        <PendingIcon color="warning" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={delivery.deliveryLocation}
                    secondary={`${t('delivery.scheduled_for')}: ${formatDate(delivery.scheduledDate)}`}
                  />
                  <ListItemSecondaryAction>
                    {getStatusChip(delivery.status)}
                    <IconButton 
                      edge="end" 
                      onClick={() => handleOpenDetails(delivery)}
                      sx={{ ml: 1 }}
                    >
                      <InfoIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              {t('driver.tasks.no_deliveries')}
            </Typography>
          </Box>
        )}
      </Paper>
      
      {/* Delivery Details Dialog */}
      <Dialog open={openDetailsDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        {selectedDelivery && (
          <>
            <DialogTitle>
              {t('delivery.details')}
              {getStatusChip(selectedDelivery.status)}
            </DialogTitle>
            <DialogContent>
              <Typography variant="subtitle1" gutterBottom>
                {t('delivery.pickup_location')}:
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedDelivery.pickupLocation}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                {t('delivery.delivery_location')}:
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedDelivery.deliveryLocation}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                {t('delivery.customer')}:
              </Typography>
              <Typography variant="body1" paragraph>
                {selectedDelivery.customer?.name || 'N/A'}<br />
                {selectedDelivery.customer?.phone || 'N/A'}<br />
                {selectedDelivery.customer?.email || 'N/A'}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                {t('delivery.scheduled_date')}:
              </Typography>
              <Typography variant="body1" paragraph>
                {formatDate(selectedDelivery.scheduledDate)}
              </Typography>
              
              {selectedDelivery.notes && (
                <>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('delivery.notes')}:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedDelivery.notes}
                  </Typography>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {selectedDelivery.status === 'pending' && (
                <Button 
                  onClick={() => handleStartDelivery(selectedDelivery.id)}
                  color="primary"
                  startIcon={<LocalShippingIcon />}
                >
                  {t('driver.tasks.start_delivery')}
                </Button>
              )}
              
              {selectedDelivery.status === 'in_progress' && (
                <Button 
                  onClick={() => handleOpenComplete(selectedDelivery)}
                  color="success"
                  startIcon={<CheckCircleIcon />}
                >
                  {t('driver.tasks.complete_delivery')}
                </Button>
              )}
              
              <Button onClick={handleCloseDialogs}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Complete Delivery Dialog */}
      <Dialog open={openCompleteDialog} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>{t('driver.tasks.complete_delivery')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            {t('driver.tasks.complete_delivery_prompt')}
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="notes"
            label={t('delivery.notes')}
            type="text"
            fullWidth
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          
          <Button 
            variant="outlined" 
            startIcon={<PhotoCameraIcon />}
            fullWidth
            sx={{ mt: 2 }}
          >
            {t('driver.tasks.take_photo')}
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleCompleteDelivery} color="success">
            {t('driver.tasks.confirm_completion')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryTasks;