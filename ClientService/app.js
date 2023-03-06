require('dotenv').config(); // require .env file for environment variables

const express = require('express'); //require express
const player = require('./routes/player'); //import routes

const app = express(); //Initiate application

app.use(player)//Add the player router to the application

// port where the service will run
const PORT = 6000

app.listen(PORT,() => {
  console.log(`Player service running on port ${PORT}`);
});

module.exports = app;