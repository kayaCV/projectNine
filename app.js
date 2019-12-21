'use strict';

// load modules
const express = require('express');
const morgan = require('morgan');
const Sequelize = require('sequelize');
const routes = require('./routes');
// const { sequelize, models } = require('./db');
// const { Person, Movie } = models;

//////////////////////////////////////////////////////
/// TESTING CONNECTION TO DB
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'movies.db'
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('ESTA CANEKADU!');
  } catch (error) {
    console.error('Error connecting to the database: ', error);
  }
})();
/// TESTING CONNECTION TO DB ^
//////////////////////////////////////////////////////

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

// expect request to come in as json
app.use(express.json()); 

// Add routes.
app.use('/api', routes);

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
