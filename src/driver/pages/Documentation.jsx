import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

// MUI components
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';

// MUI icons
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import ArticleIcon from '@mui/icons-material/Article';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Documentation = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch documents from Firestore
  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        // Get current user ID (in a real app, this would come from auth)
        const driverId = 'current-driver-id'; // Placeholder
        
        // Fetch documents
        const documentsQuery = query(
          collection(db, 'documents'),
          orderBy('createdAt', 'desc')
        );
        const documentsSnapshot = await getDocs(documentsQuery);
        const documentsData = documentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDocuments(documentsData);
        setFilteredDocuments(documentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
    
    // For demo purposes, add some sample documents if none exist
    if (documents.length === 0) {
      const sampleDocuments = [
        {
          id: '1',
          title: 'Driver Handbook',
          description: 'Complete guide for delivery drivers',
          fileType: 'pdf',
          fileSize: '2.4 MB',
          createdAt: { seconds: Date.now() / 1000 - 86400 * 30 }, // 30 days ago
          category: 'handbook'
        },
        {
          id: '2',
          title: 'Vehicle Inspection Checklist',
          description: 'Daily vehicle inspection form',
          fileType: 'pdf',
          fileSize: '0.5 MB',
          createdAt: { seconds: Date.now() / 1000 - 86400 * 15 }, // 15 days ago
          category: 'form'
        },
        {
          id: '3',
          title: 'Delivery Confirmation Template',
          description: 'Template for delivery confirmations',
          fileType: 'docx',
          fileSize: '0.3 MB',
          createdAt: { seconds: Date.now() / 1000 - 86400 * 7 }, // 7 days ago
          category: 'template'
        },
        {
          id: '4',
          title: 'Company Policy Updates',
          description: 'Recent updates to company policies',
          fileType: 'pdf',
          fileSize: '1.2 MB',
          createdAt: { seconds: Date.now() / 1000 - 86400 * 3 }, // 3 days ago
          category: 'policy'
        },
        {
          id: '5',
          title: 'Route Optimization Guide',
          description: 'Best practices for route optimization',
          fileType: 'pdf',
          fileSize: '1.8 MB',
          createdAt: { seconds: Date.now() / 1000 - 86400 }, // 1 day ago
          category: 'guide'
        }
      ];
      
      setDocuments(sampleDocuments);
      setFilteredDocuments(sampleDocuments);
    }
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery) {
      setFilteredDocuments(documents);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = documents.filter(doc => 
      doc.title.toLowerCase().includes(query) || 
      doc.description.toLowerCase().includes(query) ||
      doc.category.toLowerCase().includes(query)
    );
    
    setFilteredDocuments(filtered);
  }, [searchQuery, documents]);

  // Get icon based on file type
  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'docx':
      case 'doc':
        return <DescriptionIcon color="primary" />;
      case 'jpg':
      case 'png':
      case 'jpeg':
        return <ImageIcon color="success" />;
      default:
        return <ArticleIcon />;
    }
  };

  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString();
  };

  // Handle document view/download
  const handleDocumentAction = (document, action) => {
    // In a real app, this would open the document or download it
    console.log(`${action} document:`, document.title);
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
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder={t('driver.documents.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="outlined"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Documents List */}
      <Paper>
        <List>
          {filteredDocuments.length > 0 ? (
            filteredDocuments.map((document, index) => (
              <Box key={document.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemIcon>
                    {getFileIcon(document.fileType)}
                  </ListItemIcon>
                  <ListItemText
                    primary={document.title}
                    secondary={
                      <>
                        {document.description}
                        <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center' }}>
                          <Typography variant="caption" color="textSecondary" sx={{ mr: 1 }}>
                            {document.fileSize} • {formatDate(document.createdAt)}
                          </Typography>
                          <Chip 
                            label={document.category} 
                            size="small" 
                            variant="outlined" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDocumentAction(document, 'view')}
                      sx={{ mr: 1 }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton 
                      edge="end" 
                      onClick={() => handleDocumentAction(document, 'download')}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                {searchQuery ? 
                  t('driver.documents.no_search_results') : 
                  t('driver.documents.no_documents')}
              </Typography>
            </Box>
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default Documentation;