const app = require("./app");
const initCronJobs = require("./scripts/cronJobs");

const port = process.env.PORT || 8000;

if (process.env.NODE_ENV !== "test") {
  initCronJobs();
}

// Start the server
const server = app.listen(port, () => {
  console.log(` VolunSphere Server running on http://localhost:${port}`);
  console.log(` Server started at: ${new Date().toLocaleString()}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
});

// Configure proper shutdown
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
  console.log(" Received shutdown signal, closing server...");
  server.close(() => {
    console.log(" HTTP server closed");

    // Close any database connections or other resources
    console.log(" Closing database connections...");

    // Exit process
    console.log(" Process terminated gracefully");
    process.exit(0);
  });

  // Force close after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error("⚠️ Forcing shutdown after timeout");
    process.exit(1);
  }, 10000);
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log(" UNHANDLED REJECTION. Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);

  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log(" UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message);
  console.log(err.stack);

  process.exit(1);
});
