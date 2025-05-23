import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources
const resources = {
  en: {
    translation: {
      // Common
      'app.name': 'TruckTrack',
      'app.tagline': 'Comprehensive Logistics Management',
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.view': 'View',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.status': 'Status',
      'common.actions': 'Actions',
      'common.offline': 'You are currently offline. Some features may be unavailable.',
      
      // Authentication
      'auth.login': 'Login',
      'auth.logout': 'Logout',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot Password?',
      'auth.resetPassword': 'Reset Password',
      
      // Admin Dashboard
      'admin.dashboard.title': 'Admin Dashboard',
      'admin.dashboard.activeDeliveries': 'Active Deliveries',
      'admin.dashboard.availableDrivers': 'Available Drivers',
      'admin.dashboard.pendingDeliveries': 'Pending Deliveries',
      'admin.dashboard.completedToday': 'Completed Today',
      
      // Delivery Management
      'delivery.management.title': 'Delivery Management',
      'delivery.create': 'Create Delivery',
      'delivery.edit': 'Edit Delivery',
      'delivery.view': 'View Delivery',
      'delivery.assign': 'Assign Delivery',
      'delivery.status.pending': 'Pending',
      'delivery.status.assigned': 'Assigned',
      'delivery.status.inProgress': 'In Progress',
      'delivery.status.completed': 'Completed',
      'delivery.status.cancelled': 'Cancelled',
      'delivery.priority.low': 'Low',
      'delivery.priority.medium': 'Medium',
      'delivery.priority.high': 'High',
      'delivery.priority.urgent': 'Urgent',
      
      // Driver Management
      'driver.management.title': 'Driver Management',
      'driver.create': 'Add Driver',
      'driver.edit': 'Edit Driver',
      'driver.view': 'View Driver',
      'driver.status.available': 'Available',
      'driver.status.onDelivery': 'On Delivery',
      'driver.status.offDuty': 'Off Duty',
      
      // Document Management
      'document.management.title': 'Document Management',
      'document.upload': 'Upload Document',
      'document.view': 'View Document',
      'document.delete': 'Delete Document',
      
      // Reporting & Analytics
      'reports.title': 'Reports & Analytics',
      'reports.deliveryPerformance': 'Delivery Performance',
      'reports.driverEfficiency': 'Driver Efficiency',
      'reports.customerHistory': 'Customer History',
      'reports.routeOptimization': 'Route Optimization',
      
      // Driver App
      'driver.dashboard.title': 'Driver Dashboard',
      'driver.tasks.title': 'My Deliveries',
      'driver.navigation.title': 'Navigation',
      'driver.messages.title': 'Messages',
      'driver.documents.title': 'Documents',
      'driver.status.update': 'Update Status',
      'driver.arrived': 'Arrived',
      'driver.loading': 'Loading',
      'driver.unloading': 'Unloading',
      'driver.departed': 'Departed',
      'driver.completed': 'Completed',
      'driver.issue': 'Report Issue',
    }
  },
  hi: {
    translation: {
      // Common
      'app.name': 'ट्रकट्रैक',
      'app.tagline': 'व्यापक लॉजिस्टिक्स प्रबंधन',
      'common.loading': 'लोड हो रहा है...',
      'common.error': 'एक त्रुटि हुई',
      'common.save': 'सहेजें',
      'common.cancel': 'रद्द करें',
      'common.delete': 'हटाएं',
      'common.edit': 'संपादित करें',
      'common.view': 'देखें',
      'common.search': 'खोजें',
      'common.filter': 'फ़िल्टर',
      'common.status': 'स्थिति',
      'common.actions': 'कार्रवाई',
      'common.offline': 'आप वर्तमान में ऑफ़लाइन हैं। कुछ सुविधाएँ अनुपलब्ध हो सकती हैं।',
      
      // Authentication
      'auth.login': 'लॉगिन',
      'auth.logout': 'लॉगआउट',
      'auth.register': 'रजिस्टर',
      'auth.email': 'ईमेल',
      'auth.password': 'पासवर्ड',
      'auth.forgotPassword': 'पासवर्ड भूल गए?',
      'auth.resetPassword': 'पासवर्ड रीसेट करें',
      
      // Admin Dashboard
      'admin.dashboard.title': 'एडमिन डैशबोर्ड',
      'admin.dashboard.activeDeliveries': 'सक्रिय डिलीवरी',
      'admin.dashboard.availableDrivers': 'उपलब्ध ड्राइवर',
      'admin.dashboard.pendingDeliveries': 'लंबित डिलीवरी',
      'admin.dashboard.completedToday': 'आज पूरा किया गया',
      
      // More translations would be added for Hindi
    }
  },
  // Additional languages would be added here
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;