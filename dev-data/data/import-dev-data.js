const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel.js');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

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

// Reading DATA
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// Importing DATA

const importData = async (req, res) => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded !');
  } catch (err) {
    console.log(err);
  }
};
// Delated all the data in collections

const deleteData = async (req, res) => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully del !');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
} else {
  console.log('Something went wrong 1');
}

// console.log(process.argv);
