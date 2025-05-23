// Data models for TruckTrack application

// User model - for both admin and driver users
export const UserModel = {
  id: '', // UID from Firebase Auth
  name: '',
  email: '',
  phone: '',
  role: '', // 'admin' or 'driver'
  profilePicture: '',
  language: 'en', // Default language preference
  createdAt: null, // Timestamp
  lastActive: null, // Timestamp
  // Driver-specific fields
  driverId: '', // Only for drivers
  licenseNumber: '', // Only for drivers
  assignedVehicle: '', // Reference to vehicle ID, only for drivers
  status: '', // 'available', 'on_delivery', 'off_duty', only for drivers
  currentLocation: null, // GeoPoint, only for drivers
  performanceMetrics: {
    deliveriesCompleted: 0,
    onTimePercentage: 0,
    averageRating: 0,
  },
};

// Vehicle model
export const VehicleModel = {
  id: '',
  registrationNumber: '',
  type: '', // 'truck', 'van', etc.
  capacity: {
    weight: 0, // in kg
    volume: 0, // in cubic meters
  },
  status: '', // 'available', 'on_delivery', 'maintenance'
  currentLocation: null, // GeoPoint
  assignedDriver: '', // Reference to driver ID
  maintenanceRecords: [], // Array of maintenance record objects
  fuelEfficiency: 0, // km/l
  lastServiced: null, // Timestamp
};

// Delivery model
export const DeliveryModel = {
  id: '',
  status: '', // 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  priority: '', // 'low', 'medium', 'high', 'urgent'
  assignedDriver: '', // Reference to driver ID
  assignedVehicle: '', // Reference to vehicle ID
  pickup: {
    location: null, // GeoPoint
    address: '',
    landmark: '',
    contactName: '',
    contactPhone: '',
    timeWindow: {
      start: null, // Timestamp
      end: null, // Timestamp
    },
  },
  dropoff: {
    location: null, // GeoPoint
    address: '',
    landmark: '',
    contactName: '',
    contactPhone: '',
    timeWindow: {
      start: null, // Timestamp
      end: null, // Timestamp
    },
  },
  cargo: {
    type: '',
    description: '',
    quantity: 0,
    weight: 0, // in kg
    volume: 0, // in cubic meters
    specialHandling: '',
  },
  timeline: [
    // Array of status updates with timestamps
    // { status: 'assigned', timestamp: Timestamp, notes: '' }
  ],
  notes: '',
  documents: [], // Array of document references
  proofOfDelivery: {
    signature: '',
    photos: [],
    notes: '',
    timestamp: null,
  },
  createdAt: null, // Timestamp
  createdBy: '', // Reference to admin user ID
  estimatedDistance: 0, // in km
  estimatedDuration: 0, // in minutes
};

// Location model (for saved locations)
export const LocationModel = {
  id: '',
  name: '',
  type: '', // 'customer', 'warehouse', 'hub'
  address: '',
  location: null, // GeoPoint
  landmark: '',
  contactName: '',
  contactPhone: '',
  accessNotes: '',
  frequentlyVisited: false,
  createdAt: null, // Timestamp
};

// Message model (for communication)
export const MessageModel = {
  id: '',
  sender: '', // Reference to user ID
  recipients: [], // Array of user IDs
  content: '',
  type: '', // 'text', 'voice', 'urgent'
  readBy: [], // Array of user IDs who have read the message
  createdAt: null, // Timestamp
  attachments: [], // Array of attachment references
};

// Document model
export const DocumentModel = {
  id: '',
  name: '',
  type: '', // 'invoice', 'receipt', 'proof_of_delivery', etc.
  relatedTo: {
    type: '', // 'delivery', 'driver', 'vehicle', 'customer'
    id: '', // Reference to related entity ID
  },
  fileUrl: '',
  thumbnailUrl: '',
  uploadedBy: '', // Reference to user ID
  uploadedAt: null, // Timestamp
  tags: [], // Array of tag strings
};