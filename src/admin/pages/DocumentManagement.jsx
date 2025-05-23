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
  Link,
} from '@mui/material';

// MUI icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FolderIcon from '@mui/icons-material/Folder';

const DocumentManagement = () => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'invoice',
    relatedTo: '',
    uploadDate: '',
    expiryDate: '',
    status: 'active',
    fileUrl: '',
    description: ''
  });

  // Fetch documents from Firestore
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'documents'), orderBy('uploadDate', 'desc'));
        const querySnapshot = await getDocs(q);
        const documentData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDocuments(documentData);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
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
      title: '',
      type: 'invoice',
      relatedTo: '',
      uploadDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'active',
      fileUrl: '',
      description: ''
    });
    setOpenAddDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (document) => {
    setCurrentDocument(document);
    setFormData({
      title: document.title || '',
      type: document.type || 'invoice',
      relatedTo: document.relatedTo || '',
      uploadDate: document.uploadDate ? new Date(document.uploadDate.seconds * 1000).toISOString().split('T')[0] : '',
      expiryDate: document.expiryDate ? new Date(document.expiryDate.seconds * 1000).toISOString().split('T')[0] : '',
      status: document.status || 'active',
      fileUrl: document.fileUrl || '',
      description: document.description || ''
    });
    setOpenEditDialog(true);
  };

  // Open view dialog
  const handleOpenViewDialog = (document) => {
    setCurrentDocument(document);
    setOpenViewDialog(true);
  };

  // Open delete dialog
  const handleOpenDeleteDialog = (document) => {
    setCurrentDocument(document);
    setOpenDeleteDialog(true);
  };

  // Close dialogs
  const handleCloseDialogs = () => {
    setOpenAddDialog(false);
    setOpenEditDialog(false);
    setOpenDeleteDialog(false);
    setOpenViewDialog(false);
    setCurrentDocument(null);
  };

  // Add new document
  const handleAddDocument = async () => {
    try {
      await addDoc(collection(db, 'documents'), {
        ...formData,
        uploadDate: new Date(),
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      handleCloseDialogs();
      // Refresh the list
      const q = query(collection(db, 'documents'), orderBy('uploadDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const documentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(documentData);
    } catch (err) {
      console.error('Error adding document:', err);
      setError('Failed to add document');
    }
  };

  // Update document
  const handleUpdateDocument = async () => {
    if (!currentDocument) return;
    
    try {
      const documentRef = doc(db, 'documents', currentDocument.id);
      await updateDoc(documentRef, {
        ...formData,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : null,
        updatedAt: new Date()
      });
      handleCloseDialogs();
      // Refresh the list
      const q = query(collection(db, 'documents'), orderBy('uploadDate', 'desc'));
      const querySnapshot = await getDocs(q);
      const documentData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDocuments(documentData);
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document');
    }
  };

  // Delete document
  const handleDeleteDocument = async () => {
    if (!currentDocument) return;
    
    try {
      await deleteDoc(doc(db, 'documents', currentDocument.id));
      handleCloseDialogs();
      // Remove from state
      setDocuments(documents.filter(d => d.id !== currentDocument.id));
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document');
    }
  };

  // Get document type label
  const getDocumentTypeLabel = (type) => {
    switch (type) {
      case 'invoice':
        return t('document.type.invoice');
      case 'license':
        return t('document.type.license');
      case 'registration':
        return t('document.type.registration');
      case 'insurance':
        return t('document.type.insurance');
      case 'maintenance':
        return t('document.type.maintenance');
      case 'other':
        return t('document.type.other');
      default:
        return type;
    }
  };

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Check if document is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate.seconds * 1000);
    return expiry < new Date();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <FolderIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('document.management.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
        >
          {t('document.add')}
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
                    <TableCell>{t('document.title')}</TableCell>
                    <TableCell>{t('document.type')}</TableCell>
                    <TableCell>{t('document.related_to')}</TableCell>
                    <TableCell>{t('document.upload_date')}</TableCell>
                    <TableCell>{t('document.expiry_date')}</TableCell>
                    <TableCell>{t('document.status')}</TableCell>
                    <TableCell align="right">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((document) => (
                      <TableRow hover key={document.id}>
                        <TableCell>{document.title}</TableCell>
                        <TableCell>{getDocumentTypeLabel(document.type)}</TableCell>
                        <TableCell>{document.relatedTo}</TableCell>
                        <TableCell>
                          {document.uploadDate ? new Date(document.uploadDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {document.expiryDate ? new Date(document.expiryDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={isExpired(document.expiryDate) ? t('document.status.expired') : t(`document.status.${document.status}`)}
                            color={isExpired(document.expiryDate) ? 'error' : getStatusColor(document.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenViewDialog(document)}
                            title={t('document.view')}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {document.fileUrl && (
                            <IconButton 
                              size="small" 
                              color="primary" 
                              component="a"
                              href={document.fileUrl}
                              target="_blank"
                              title={t('document.download')}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleOpenEditDialog(document)}
                            title={t('document.edit')}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleOpenDeleteDialog(document)}
                            title={t('document.delete')}
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
              count={documents.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add Document Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{t('document.add')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.title')}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('document.type')}</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label={t('document.type')}
                >
                  <MenuItem value="invoice">{t('document.type.invoice')}</MenuItem>
                  <MenuItem value="license">{t('document.type.license')}</MenuItem>
                  <MenuItem value="registration">{t('document.type.registration')}</MenuItem>
                  <MenuItem value="insurance">{t('document.type.insurance')}</MenuItem>
                  <MenuItem value="maintenance">{t('document.type.maintenance')}</MenuItem>
                  <MenuItem value="other">{t('document.type.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.related_to')}
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleInputChange}
                margin="normal"
                helperText={t('document.related_to_help')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('document.status')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('document.status')}
                >
                  <MenuItem value="active">{t('document.status.active')}</MenuItem>
                  <MenuItem value="pending">{t('document.status.pending')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.upload_date')}
                name="uploadDate"
                type="date"
                value={formData.uploadDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.expiry_date')}
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('document.file_url')}
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
                margin="normal"
                helperText={t('document.file_url_help')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('document.description')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleAddDocument} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{t('document.edit')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.title')}
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('document.type')}</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label={t('document.type')}
                >
                  <MenuItem value="invoice">{t('document.type.invoice')}</MenuItem>
                  <MenuItem value="license">{t('document.type.license')}</MenuItem>
                  <MenuItem value="registration">{t('document.type.registration')}</MenuItem>
                  <MenuItem value="insurance">{t('document.type.insurance')}</MenuItem>
                  <MenuItem value="maintenance">{t('document.type.maintenance')}</MenuItem>
                  <MenuItem value="other">{t('document.type.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.related_to')}
                name="relatedTo"
                value={formData.relatedTo}
                onChange={handleInputChange}
                margin="normal"
                helperText={t('document.related_to_help')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>{t('document.status')}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  label={t('document.status')}
                >
                  <MenuItem value="active">{t('document.status.active')}</MenuItem>
                  <MenuItem value="pending">{t('document.status.pending')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.upload_date')}
                name="uploadDate"
                type="date"
                value={formData.uploadDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('document.expiry_date')}
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleInputChange}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('document.file_url')}
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleInputChange}
                margin="normal"
                helperText={t('document.file_url_help')}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('document.description')}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleUpdateDocument} variant="contained">{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>{currentDocument?.title}</DialogTitle>
        <DialogContent>
          {currentDocument && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">{t('document.type')}</Typography>
                <Typography variant="body1" gutterBottom>{getDocumentTypeLabel(currentDocument.type)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">{t('document.related_to')}</Typography>
                <Typography variant="body1" gutterBottom>{currentDocument.relatedTo || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">{t('document.upload_date')}</Typography>
                <Typography variant="body1" gutterBottom>
                  {currentDocument.uploadDate ? new Date(currentDocument.uploadDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">{t('document.expiry_date')}</Typography>
                <Typography variant="body1" gutterBottom>
                  {currentDocument.expiryDate ? new Date(currentDocument.expiryDate.seconds * 1000).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2">{t('document.status')}</Typography>
                <Chip 
                  label={isExpired(currentDocument.expiryDate) ? t('document.status.expired') : t(`document.status.${currentDocument.status}`)}
                  color={isExpired(currentDocument.expiryDate) ? 'error' : getStatusColor(currentDocument.status)}
                  size="small"
                  sx={{ my: 1 }}
                />
              </Grid>
              {currentDocument.fileUrl && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">{t('document.file')}</Typography>
                  <Link href={currentDocument.fileUrl} target="_blank" rel="noopener">
                    {t('document.view_download')}
                  </Link>
                </Grid>
              )}
              {currentDocument.description && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">{t('document.description')}</Typography>
                  <Typography variant="body1" gutterBottom>{currentDocument.description}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.close')}</Button>
          {currentDocument?.fileUrl && (
            <Button 
              component="a"
              href={currentDocument.fileUrl}
              target="_blank"
              variant="contained"
              startIcon={<DownloadIcon />}
            >
              {t('document.download')}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDialogs}>
        <DialogTitle>{t('document.delete.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('document.delete.confirmation')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteDocument} color="error">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DocumentManagement;