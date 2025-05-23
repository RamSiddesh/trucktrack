import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Snackbar, Alert } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';

/**
 * Component to display an offline status indicator when the user loses internet connection
 * This is especially important for the Indian context where connectivity can be intermittent
 */
const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [open, setOpen] = useState(!navigator.onLine);

  useEffect(() => {
    // Function to handle online status change
    const handleOnline = () => {
      setIsOffline(false);
      setOpen(false);
    };

    // Function to handle offline status change
    const handleOffline = () => {
      setIsOffline(true);
      setOpen(true);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle closing the snackbar
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  // If user comes back online, don't show anything
  if (!isOffline) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: { xs: 90, sm: 0 } }} // Adjust for mobile navigation bar
    >
      <Alert 
        icon={<WifiOffIcon />}
        severity="warning" 
        variant="filled"
        onClose={handleClose}
        sx={{ width: '100%' }}
      >
        {t('common.offline')}
      </Alert>
    </Snackbar>
  );
};

export default OfflineIndicator;