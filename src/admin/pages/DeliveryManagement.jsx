import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

// MUI components
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';

// MUI icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';

const DeliveryManagement = () => {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [formData, setFormData] = useState({
    pickupLocation: '',
    deliveryLocation: '',
    status: 'pending',
    priority: 'normal',
    scheduledDate: '',
    customer: {
      name: '',
      phone: '',
      email: ''
    },
    items: []
  });

  // Fetch deliveries from Firestore
  useEffect(() => {
    const fetchDeliveries = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'deliveries'), orderBy('scheduledDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const deliveryData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDeliveries(deliveryData);
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

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      pickupLocation: '',
      deliveryLocation: '',
      status: 'pending',
      priority: 'normal',
      scheduledDate: new Date().toISOString().split('T')[0],
      customer: {
        name: '',
        phone: '',
        email: ''
      },
      items: []
    });
    setOpenAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (delivery) => {
    setCurrentDelivery(delivery);
    setFormData({
      pickupLocation: delivery.pickupLocation || '',
      deliveryLocation: delivery.deliveryLocation || '',
      status: delivery.status || 'pending',
      priority: delivery.priority || 'normal',
      scheduledDate: delivery.scheduledDate ? new Date(delivery.scheduledDate.seconds * 1000).toISOString().split('T')[0] : '',
      customer: {
        name: delivery.customer?.name || '',
        phone: delivery.customer?.phone || '',
        email: delivery.customer?.email || ''
      },
      items: delivery.items || []
    });
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (delivery) => {
    setCurrentDelivery(delivery);
    setOpenDeleteDialog(true);
  };

  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentDelivery(null);
  };

  // Add new delivery
  const handleAddDelivery = async () => {
    try {
      await addDoc(collection(db, 'deliveries'), {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      handleCloseDialogs();
      // Refresh the list
      const q = query(collection(db, 'deliveries'), orderBy('scheduledDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const deliveryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeliveries(deliveryData);
    } catch (err) {
      console.error('Error adding delivery:', err);
      setError('Failed to add delivery');
    }
  };

  // Update delivery
  const handleUpdateDelivery = async () => {
    if (!currentDelivery) return;
    
    try {
      const deliveryRef = doc(db, 'deliveries', currentDelivery.id);
      await updateDoc(deliveryRef, {
        ...formData,
        updatedAt: new Date()
      });
      handleCloseDialogs();
      // Refresh the list
      const q = query(collection(db, 'deliveries'), orderBy('scheduledDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const deliveryData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDeliveries(deliveryData);
    } catch (err) {
      console.error('Error updating delivery:', err);
      setError('Failed to update delivery');
    }
  };

  // Delete delivery
  const handleDeleteDelivery = async () => {
    if (!currentDelivery) return;
    
    try {
      await deleteDoc(doc(db, 'deliveries', currentDelivery.id));
      handleCloseDialogs();
      // Remove from state
      setDeliveries(deliveries.filter(d => d.id !== currentDelivery.id));
    } catch (err) {
      console.error('Error deleting delivery:', err);
      setError('Failed to delete delivery');
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'assigned':
        return 'info';
      case 'in_progress':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get priority chip color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'normal':
        return 'primary';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <LocalShippingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('delivery.management.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          {t('delivery.add')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 240px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('delivery.id')}</TableCell>
                    <TableCell>{t('delivery.customer')}</TableCell>
                    <TableCell>{t('delivery.pickup')}</TableCell>
                    <TableCell>{t('delivery.destination')}</TableCell>
                    <TableCell>{t('delivery.status')}</TableCell>
                    <TableCell>{t('delivery.priority')}</TableCell>
                    <TableCell>{t('delivery.scheduled')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveries
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((delivery) => (
                      <TableRow hover key={delivery.id}>
                        <TableCell>{delivery.id.substring(0, 8)}</TableCell>
                        <TableCell>{delivery.customer?.name || 'N/A'}</TableCell>
                        <TableCell>{delivery.pickupLocation}</TableCell>
                        <TableCell>{delivery.deliveryLocation}</TableCell>
                        <TableCell>
                          <Chip 
                            label={t(`delivery.status.${delivery.status}`)} 
                            color={getStatusColor(delivery.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={t(`delivery.priority.${delivery.priority}`)} 
                            color={getPriorityColor(delivery.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {delivery.scheduledDate ? new Date(delivery.scheduledDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(delivery)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(delivery)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={deliveries.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add Delivery Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{t('delivery.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('delivery.pickup')}
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('delivery.destination')}
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('delivery.status.label')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('delivery.status.label')}
                >
                  <MenuItem value="pending">{t('delivery.status.pending')}</MenuItem>
                  <MenuItem value="assigned">{t('delivery.status.assigned')}</MenuItem>
                  <MenuItem value="in_progress">{t('delivery.status.in_progress')}</MenuItem>
                  <MenuItem value="completed">{t('delivery.status.completed')}</MenuItem>
                  <MenuItem value="cancelled">{t('delivery.status.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('delivery.priority.label')}</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label={t('delivery.priority.label')}
                >
                  <MenuItem value="low">{t('delivery.priority.low')}</MenuItem>
                  <MenuItem value="normal">{t('delivery.priority.normal')}</MenuItem>
                  <MenuItem value="high">{t('delivery.priority.high')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('delivery.scheduled')}
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                {t('customer.details')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('customer.name')}
                name="customer.name"
                value={formData.customer.name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('customer.phone')}
                name="customer.phone"
                value={formData.customer.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('customer.email')}
                name="customer.email"
                value={formData.customer.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleAddDelivery} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Delivery Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{t('delivery.edit')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('delivery.pickup')}
                name="pickupLocation"
                value={formData.pickupLocation}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('delivery.destination')}
                name="deliveryLocation"
                value={formData.deliveryLocation}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('delivery.status.label')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('delivery.status.label')}
                >
                  <MenuItem value="pending">{t('delivery.status.pending')}</MenuItem>
                  <MenuItem value="assigned">{t('delivery.status.assigned')}</MenuItem>
                  <MenuItem value="in_progress">{t('delivery.status.in_progress')}</MenuItem>
                  <MenuItem value="completed">{t('delivery.status.completed')}</MenuItem>
                  <MenuItem value="cancelled">{t('delivery.status.cancelled')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('delivery.priority.label')}</InputLabel>
                <Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  label={t('delivery.priority.label')}
                >
                  <MenuItem value="low">{t('delivery.priority.low')}</MenuItem>
                  <MenuItem value="normal">{t('delivery.priority.normal')}</MenuItem>
                  <MenuItem value="high">{t('delivery.priority.high')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('delivery.scheduled')}
                name="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                {t('customer.details')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('customer.name')}
                name="customer.name"
                value={formData.customer.name}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('customer.phone')}
                name="customer.phone"
                value={formData.customer.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label={t('customer.email')}
                name="customer.email"
                value={formData.customer.email}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleUpdateDelivery} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>{t('delivery.delete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('delivery.delete.confirmation')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteDelivery} color="error">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DeliveryManagement;