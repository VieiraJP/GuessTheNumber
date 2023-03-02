require('dotenv').config(); // require .env file for environment variables

const amqp = require('amqplib');
const express = require('express'); //require express
const player = require('./routes/player'); //import routes

const app = express(); //Initiate application

app.use(player)//Add the player router to the application

// port where the service will run
const PORT = 9005

app.listen(PORT, '0.0.0.0',() => {
  console.log(`Player service running on port ${PORT}`);
});

module.exports = app;