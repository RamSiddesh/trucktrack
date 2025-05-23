import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// MUI components
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';

// MUI icons
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PersonIcon from '@mui/icons-material/Person';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

const Communication = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Fetch messages from Firestore
  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        // Get current user ID (in a real app, this would come from auth)
        const driverId = 'current-driver-id'; // Placeholder
        
        // Fetch messages for this driver
        const messagesQuery = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', driverId),
          orderBy('timestamp', 'asc')
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesData = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMessages(messagesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // For demo purposes, add some sample messages if none exist
    if (messages.length === 0) {
      setMessages([
        {
          id: '1',
          text: 'Hello, how can I help you today?',
          sender: 'support',
          senderName: 'Support Team',
          timestamp: { seconds: Date.now() / 1000 - 3600 }
        },
        {
          id: '2',
          text: 'I have a question about my current delivery.',
          sender: 'driver',
          senderName: 'Me',
          timestamp: { seconds: Date.now() / 1000 - 3500 }
        },
        {
          id: '3',
          text: 'Sure, what would you like to know?',
          sender: 'support',
          senderName: 'Support Team',
          timestamp: { seconds: Date.now() / 1000 - 3400 }
        }
      ]);
    }
  }, []);

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    try {
      // Get current user ID (in a real app, this would come from auth)
      const driverId = 'current-driver-id'; // Placeholder
      
      // Create new message
      const messageData = {
        text: newMessage,
        sender: 'driver',
        senderName: 'Me', // In a real app, this would be the user's name
        timestamp: serverTimestamp(),
        participants: [driverId, 'support']
      };
      
      // Add to Firestore
      // In a real app, this would be added to Firestore
      // await addDoc(collection(db, 'messages'), messageData);
      
      // For demo purposes, add to local state
      setMessages([...messages, {
        id: Date.now().toString(),
        ...messageData,
        timestamp: { seconds: Date.now() / 1000 }
      }]);
      
      // Clear input
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Messages Header */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">
          {t('driver.messages.title')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {t('driver.messages.subtitle')}
        </Typography>
      </Paper>
      
      {/* Messages List */}
      <Paper sx={{ p: 2, mb: 2, flexGrow: 1, overflow: 'auto' }}>
        <List>
          {messages.map((message, index) => (
            <Box key={message.id}>
              {index > 0 && <Divider variant="inset" component="li" />}
              <ListItem alignItems="flex-start" sx={{
                textAlign: message.sender === 'driver' ? 'right' : 'left',
                flexDirection: message.sender === 'driver' ? 'row-reverse' : 'row'
              }}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: message.sender === 'driver' ? 'primary.main' : 'secondary.main' }}>
                    {message.sender === 'driver' ? <PersonIcon /> : <SupportAgentIcon />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      component="span"
                      variant="body1"
                    >
                      {message.senderName}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                        sx={{ display: 'block', mt: 0.5, mb: 0.5 }}
                      >
                        {message.text}
                      </Typography>
                      <Typography
                        component="span"
                        variant="caption"
                        color="textSecondary"
                      >
                        {formatTime(message.timestamp)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Paper>
      
      {/* Message Input */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex' }}>
          <TextField
            fullWidth
            placeholder={t('driver.messages.type_message')}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            variant="outlined"
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton>
                    <AttachFileIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={sending || !newMessage.trim()}
            sx={{ ml: 1 }}
          >
            {t('driver.messages.send')}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Communication;