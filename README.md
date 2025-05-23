# Logistech

Logistech is a modern web application designed for comprehensive logistics management. It provides tools for document management, real-time tracking, reporting, and analytics to streamline logistics operations.

## Key Features

*   **Dashboard:** Overview of key logistics metrics and activities.
*   **Shipment Management:** Track and manage shipments from origin to destination.
*   **Vehicle Tracking:** Real-time location tracking of vehicles.
*   **Document Management:** Upload, organize, and manage logistics-related documents (invoices, bills of lading, etc.).
*   **Reporting & Analytics:** Generate reports and visualize data on delivery performance, costs, and other key indicators.
*   **User Roles:** Differentiated access and functionalities for administrators, drivers, and potentially clients.
*   **Internationalization:** Support for multiple languages.

## Technology Stack

*   **Frontend:**
    *   React 19
    *   Vite (Build Tool)
    *   React Router DOM (Routing)
    *   Material-UI (UI Components)
    *   Recharts (Charting Library)
    *   i18next (Internationalization)
    *   Leaflet & React-Leaflet (Mapping)
*   **Backend/Database:**
    *   Firebase (Firestore, Authentication, Storage)
*   **Development:**
    *   ESLint (Linting)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (comes with Node.js)
*   Firebase Account and Project Setup

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd logistech
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    *   Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
    *   In your Firebase project, go to Project settings > General.
    *   Under "Your apps", click on the "Web" icon (</>) to add a web app.
    *   Register your app and copy the `firebaseConfig` object.
    *   Create a file named `.env` in the root of the project and add your Firebase configuration. It should look like this:
        ```env
        VITE_FIREBASE_API_KEY="your-api-key"
        VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
        VITE_FIREBASE_PROJECT_ID="your-project-id"
        VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
        VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
        VITE_FIREBASE_APP_ID="your-app-id"
        VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id" # Optional
        ```
    *   Ensure your `src/firebase/config.js` file is set up to read these environment variables:
        ```javascript
        // src/firebase/config.js
        import { initializeApp } from "firebase/app";
        import { getFirestore } from "firebase/firestore";
        import { getAuth } from "firebase/auth";
        import { getStorage } from "firebase/storage";

        const firebaseConfig = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID // Optional
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);
        const storage = getStorage(app);

        export { db, auth, storage, app };
        ```
    *   **Important:** Add `.env` to your `.gitignore` file if it's not already there to prevent committing your Firebase keys. (This is already done as per the initial context).

4.  **Enable Firestore and Authentication in your Firebase project console.**
    *   For Firestore, create a database in production mode and set up security rules as needed.
    *   For Authentication, enable the sign-in methods you plan to use (e.g., Email/Password).

### Running the Application

*   **Development Server:**
    ```bash
    npm run dev
    ```
    This will start the Vite development server, typically at `http://localhost:5173`.

*   **Linting:**
    ```bash
    npm run lint
    ```

*   **Build for Production:**
    ```bash
    npm run build
    ```
    This creates a `dist` folder with the production-ready files.

*   **Preview Production Build:**
    ```bash
    npm run preview
    ```
    This serves the `dist` folder locally, typically at `http://localhost:4173`.

## Contributing

Contributions are welcome! Please follow the standard fork-and-pull-request workflow.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## License

This project is currently unlicensed. (You can add a license file like MIT, Apache 2.0, etc., if you wish).
