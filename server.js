const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE;
// console.log(process.env.EMAIL_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB Connected successfull !');
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
  console.log('SIGTERM RECIVED.Shutting down immediately !');
  server.close(() => {
    console.log('Process terminated !');
  });
});
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});
