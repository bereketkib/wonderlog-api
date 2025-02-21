const app = require("./app");
const { PORT } = require("./config/env");

// Server Initialization
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Global Error Handlers
const handleProcessErrors = () => {
  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    gracefulShutdown();
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    gracefulShutdown();
  });
};

// Graceful Shutdown
const gracefulShutdown = () => {
  server.close(() => {
    console.log("Server is shutting down...");
    process.exit(1);
  });
};

// Initialize Error Handlers
handleProcessErrors();
