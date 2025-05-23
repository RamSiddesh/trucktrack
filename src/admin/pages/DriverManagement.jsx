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
  Avatar,
} from '@mui/material';

// MUI icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

const DriverManagement = () => {
  const { t } = useTranslation();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    licenseExpiry: '',
    status: 'active',
    vehicleAssigned: '',
    address: '',
    joiningDate: '',
    rating: 0
  });

  // Fetch drivers from Firestore
  useEffect(() => {
    const fetchDrivers = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'), 
          where('role', '==', 'driver'),
          orderBy('name')
        );
        const querySnapshot = await getDocs(q);
        const driverData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDrivers(driverData);
        setError(null);
      } catch (err) {
        console.error('Error fetching drivers:', err);
        setError('Failed to load drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
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
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      licenseExpiry: '',
      status: 'active',
      vehicleAssigned: '',
      address: '',
      joiningDate: new Date().toISOString().split('T')[0],
      rating: 0
    });
    setOpenAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (driver) => {
    setCurrentDriver(driver);
    setFormData({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry.seconds * 1000).toISOString().split('T')[0] : '',
      status: driver.status || 'active',
      vehicleAssigned: driver.vehicleAssigned || '',
      address: driver.address || '',
      joiningDate: driver.joiningDate ? new Date(driver.joiningDate.seconds * 1000).toISOString().split('T')[0] : '',
      rating: driver.rating || 0
    });
    setOpenEditDialog(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (driver) => {
    setCurrentDriver(driver);
    setOpenDeleteDialog(true);
  };

  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setCurrentDriver(null);
  };

  // Add new driver
  const handleAddDriver = async () => {
    try {
      await addDoc(collection(db, 'users'), {
        ...formData,
        role: 'driver',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      handleCloseDialogs();
      // Refresh the list
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'driver'),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      const driverData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrivers(driverData);
    } catch (err) {
      console.error('Error adding driver:', err);
      setError('Failed to add driver');
    }
  };

  // Update driver
  const handleUpdateDriver = async () => {
    if (!currentDriver) return;
    
    try {
      const driverRef = doc(db, 'users', currentDriver.id);
      await updateDoc(driverRef, {
        ...formData,
        updatedAt: new Date()
      });
      handleCloseDialogs();
      // Refresh the list
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'driver'),
        orderBy('name')
      );
      const querySnapshot = await getDocs(q);
      const driverData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDrivers(driverData);
    } catch (err) {
      console.error('Error updating driver:', err);
      setError('Failed to update driver');
    }
  };

  // Delete driver
  const handleDeleteDriver = async () => {
    if (!currentDriver) return;
    
    try {
      await deleteDoc(doc(db, 'users', currentDriver.id));
      handleCloseDialogs();
      // Remove from state
      setDrivers(drivers.filter(d => d.id !== currentDriver.id));
    } catch (err) {
      console.error('Error deleting driver:', err);
      setError('Failed to delete driver');
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'on_leave':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <PeopleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('driver.management.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          {t('driver.add')}
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
                    <TableCell>{t('driver.name')}</TableCell>
                    <TableCell>{t('driver.contact')}</TableCell>
                    <TableCell>{t('driver.license')}</TableCell>
                    <TableCell>{t('driver.vehicle')}</TableCell>
                    <TableCell>{t('driver.status')}</TableCell>
                    <TableCell>{t('driver.rating')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drivers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((driver) => (
                      <TableRow hover key={driver.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={driver.profilePicture} 
                              alt={driver.name}
                              sx={{ mr: 2, width: 40, height: 40 }}
                            >
                              {driver.name ? driver.name.charAt(0) : 'D'}
                            </Avatar>
                            <Typography variant="body2">{driver.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{driver.email}</Typography>
                          <Typography variant="body2" color="text.secondary">{driver.phone}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{driver.licenseNumber}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {driver.licenseExpiry ? new Date(driver.licenseExpiry.seconds * 1000).toLocaleDateString() : 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{driver.vehicleAssigned || 'Not assigned'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={t(`driver.status.${driver.status}`)} 
                            color={getStatusColor(driver.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{driver.rating ? `${driver.rating}/5` : 'N/A'}</TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(driver)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(driver)}
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
              count={drivers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add Driver Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{t('driver.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.license_number')}
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.license_expiry')}
                name="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('driver.status.label')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('driver.status.label')}
                >
                  <MenuItem value="active">{t('driver.status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('driver.status.inactive')}</MenuItem>
                  <MenuItem value="on_leave">{t('driver.status.on_leave')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.vehicle_assigned')}
                name="vehicleAssigned"
                value={formData.vehicleAssigned}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.joining_date')}
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.rating')}
                name="rating"
                type="number"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                value={formData.rating}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleAddDriver} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Driver Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{t('driver.edit')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.email')}
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.phone')}
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.address')}
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.license_number')}
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.license_expiry')}
                name="licenseExpiry"
                type="date"
                value={formData.licenseExpiry}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('driver.status.label')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('driver.status.label')}
                >
                  <MenuItem value="active">{t('driver.status.active')}</MenuItem>
                  <MenuItem value="inactive">{t('driver.status.inactive')}</MenuItem>
                  <MenuItem value="on_leave">{t('driver.status.on_leave')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.vehicle_assigned')}
                name="vehicleAssigned"
                value={formData.vehicleAssigned}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.joining_date')}
                name="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('driver.rating')}
                name="rating"
                type="number"
                inputProps={{ min: 0, max: 5, step: 0.1 }}
                value={formData.rating}
                onChange={handleInputChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleUpdateDriver} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>{t('driver.delete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('driver.delete.confirmation')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteDriver} color="error">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverManagement;