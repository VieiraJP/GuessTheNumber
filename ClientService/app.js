require('dotenv').config(); // require .env file for environment variables
const express = require('express'); //require express
const player = require('./routes/player'); //import routes
const PORT = process.env.PORT; //Get the port from the environment variable
const app = express(); //Initiate application

app.use(player)//Add the player router to the application

app.listen(PORT, () => {
  console.log(`Player service running on port ${PORT}`);
});

module.exports = app;