const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE;
console.log(process.env.NODE_ENV);

mongoose
  .connect(DB, {
    // .connect(process.env.DATABASE_LOCAL,{
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
  })
  .then(() => {
    console.log('DB Connected successfull !');
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
