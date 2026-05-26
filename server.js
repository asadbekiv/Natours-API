const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

// Catch synchronous programming errors as early as possible (must be
// registered before requiring the app).
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

const app = require('./app');

const DB = process.env.DATABASE;
const port = process.env.PORT || 8000;

let server;

mongoose
  // Fail fast (10s) with a clear message instead of hanging on the default
  // 30s server-selection timeout.
  .connect(DB, { serverSelectionTimeoutMS: 10000 })
  .then(() => {
    console.log('DB Connected successfully !');
    // Only start accepting traffic once the database is reachable, so the
    // app never serves slow 500s without a DB connection.
    server = app.listen(port, () => {
      console.log(`App is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('FATAL: could not connect to MongoDB:', err.message);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Process terminated !');
    });
  }
});
