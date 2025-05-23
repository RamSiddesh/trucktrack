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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';

// Chart components
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// MUI icons
import BarChartIcon from '@mui/icons-material/BarChart';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportingAnalytics = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('month');
  
  // Analytics data
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    cancelled: 0,
  });
  const [deliveryByDate, setDeliveryByDate] = useState([]);
  const [deliveryByStatus, setDeliveryByStatus] = useState([]);
  const [driverPerformance, setDriverPerformance] = useState([]);

  // Fetch analytics data from Firestore
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setLoading(true);
      try {
        // Get date range based on selected time range
        const startDate = getStartDate(timeRange);
        
        // Fetch deliveries within the time range
        const deliveriesQuery = query(
          collection(db, 'deliveries'),
          where('createdAt', '>=', startDate)
        );
        const deliveriesSnapshot = await getDocs(deliveriesQuery);
        const deliveries = deliveriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate delivery statistics
        const stats = {
          total: deliveries.length,
          completed: deliveries.filter(d => d.status === 'completed').length,
          pending: deliveries.filter(d => d.status === 'pending').length,
          inProgress: deliveries.filter(d => d.status === 'in_progress').length,
          cancelled: deliveries.filter(d => d.status === 'cancelled').length,
        };
        setDeliveryStats(stats);
        
        // Group deliveries by date
        const byDate = groupDeliveriesByDate(deliveries, timeRange);
        setDeliveryByDate(byDate);
        
        // Group deliveries by status
        const byStatus = [
          { name: t('delivery.status.completed'), value: stats.completed },
          { name: t('delivery.status.pending'), value: stats.pending },
          { name: t('delivery.status.in_progress'), value: stats.inProgress },
          { name: t('delivery.status.cancelled'), value: stats.cancelled },
        ];
        setDeliveryByStatus(byStatus);
        
        // Fetch drivers
        const driversQuery = query(collection(db, 'users'), where('role', '==', 'driver'));
        const driversSnapshot = await getDocs(driversQuery);
        const drivers = driversSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Calculate driver performance
        const driverStats = drivers.map(driver => {
          const driverDeliveries = deliveries.filter(d => d.driverId === driver.id);
          return {
            name: driver.name || 'Unknown Driver',
            completed: driverDeliveries.filter(d => d.status === 'completed').length,
            inProgress: driverDeliveries.filter(d => d.status === 'in_progress').length,
            total: driverDeliveries.length,
            rating: driver.rating || 0
          };
        }).filter(d => d.total > 0).sort((a, b) => b.completed - a.completed);
        
        setDriverPerformance(driverStats.slice(0, 5)); // Top 5 drivers
        
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange, t]);

  // Get start date based on time range
  const getStartDate = (range) => {
    const now = new Date();
    switch (range) {
      case 'week':
        return new Date(now.setDate(now.getDate() - 7));
      case 'month':
        return new Date(now.setMonth(now.getMonth() - 1));
      case 'quarter':
        return new Date(now.setMonth(now.getMonth() - 3));
      case 'year':
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  };

  // Group deliveries by date
  const groupDeliveriesByDate = (deliveries, range) => {
    const dateFormat = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: range === 'week' ? '2-digit' : 'short',
      year: range === 'year' ? '2-digit' : undefined,
    });
    
    const grouped = {};
    deliveries.forEach(delivery => {
      if (!delivery.createdAt) return;
      
      const date = new Date(delivery.createdAt.seconds * 1000);
      const dateKey = dateFormat.format(date);
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          total: 0,
          completed: 0,
          pending: 0,
          inProgress: 0,
          cancelled: 0,
        };
      }
      
      grouped[dateKey].total += 1;
      
      switch (delivery.status) {
        case 'completed':
          grouped[dateKey].completed += 1;
          break;
        case 'pending':
          grouped[dateKey].pending += 1;
          break;
        case 'in_progress':
          grouped[dateKey].inProgress += 1;
          break;
        case 'cancelled':
          grouped[dateKey].cancelled += 1;
          break;
        default:
          break;
      }
    });
    
    // Convert to array and sort by date
    return Object.values(grouped).sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          <BarChartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('reports.title')}
        </Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>{t('reports.time_range')}</InputLabel>
          <Select
            value={timeRange}
            label={t('reports.time_range')}
            onChange={handleTimeRangeChange}
          >
            <MenuItem value="week">{t('reports.time_range.week')}</MenuItem>
            <MenuItem value="month">{t('reports.time_range.month')}</MenuItem>
            <MenuItem value="quarter">{t('reports.time_range.quarter')}</MenuItem>
            <MenuItem value="year">{t('reports.time_range.year')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Delivery Statistics Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.total_deliveries')}</Typography>
                <Typography variant="h3">{deliveryStats.total}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.completed_deliveries')}</Typography>
                <Typography variant="h3">{deliveryStats.completed}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {deliveryStats.total > 0 ? 
                    `${Math.round((deliveryStats.completed / deliveryStats.total) * 100)}%` : 
                    '0%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.in_progress_deliveries')}</Typography>
                <Typography variant="h3">{deliveryStats.inProgress}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {deliveryStats.total > 0 ? 
                    `${Math.round((deliveryStats.inProgress / deliveryStats.total) * 100)}%` : 
                    '0%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t('reports.pending_deliveries')}</Typography>
                <Typography variant="h3">{deliveryStats.pending}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {deliveryStats.total > 0 ? 
                    `${Math.round((deliveryStats.pending / deliveryStats.total) * 100)}%` : 
                    '0%'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Delivery Trends Chart */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>{t('reports.delivery_trends')}</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={deliveryByDate}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="completed" stroke="#00C49F" name={t('delivery.status.completed')} />
                  <Line type="monotone" dataKey="inProgress" stroke="#0088FE" name={t('delivery.status.in_progress')} />
                  <Line type="monotone" dataKey="pending" stroke="#FFBB28" name={t('delivery.status.pending')} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Delivery Status Distribution */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>{t('reports.delivery_status_distribution')}</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryByStatus.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {deliveryByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Driver Performance */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>{t('reports.driver_performance')}</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={driverPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#00C49F" name={t('delivery.status.completed')} />
                  <Bar dataKey="inProgress" fill="#0088FE" name={t('delivery.status.in_progress')} />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ReportingAnalytics;