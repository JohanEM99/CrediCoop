import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

/**
 * Application Entry Point
 * Initializes the React application by mounting the root component to the DOM
 * Wraps the app in StrictMode for additional development checks and warnings
 */

// Create root element and render the application
ReactDOM.createRoot(document.getElementById("root")!).render(
  // StrictMode wrapper for highlighting potential problems in the application
  // Only runs in development mode - performs additional checks like:
  // - Detecting unexpected side effects
  // - Detecting deprecated APIs
  // - Detecting legacy context API usage
  <React.StrictMode>
    {/* Main routing component that handles all application routes */}
    <AppRoutes />
  </React.StrictMode>
);