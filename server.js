const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' });

const app = require('./app');

const DB = process.env.DATABASE;

mongoose
  .connect(DB, {})
  .then(() => {
    console.log('DB Connected successfully !');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED.Shutting down immediately !');
  server.close(() => {
    console.log('Process terminated !');
  });
});
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
