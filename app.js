'use strict'

const fs = require('fs');
const tourRouter = require('./routes/tourRoute');
const usersRouter = require('./routes/usersRoute');
const morgan = require('morgan');
const express = require('express');


const app = express();

// Our first Middlware
console.log(process.env.NODE_ENV);
if(process.env.NODE_ENV === 'development'){
    
    app.use(morgan('dev'));
}


app.use(express.json());  // Middlware 
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
    console.log('Hello from the Middlware ! 🧑‍💻');
    next();
});
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});




const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`))


// Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', usersRouter);


// Start the server
module.exports = app;
