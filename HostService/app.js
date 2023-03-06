//require .env file
require('dotenv').config();
//require express
const express = require('express');
//require body parser
const bodyParser = require('body-parser');

const amqp = require("amqplib"); ////require axios for http requests

//require router for hostgame
const hostGame = require('./routes/game');

//Initiate application
const app = express();

//Add body parser to the application
app.use(bodyParser.json());

//Add the hostGame router to the application
app.use(hostGame);

//Get the port from the environment variable
const port =4000;

let channel;
let connection;
async function connect() {
    try {
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('player');
    } catch (error) {
        console.error(error);
    }
}

connect().then(() => {
    channel.consume('player', data => {
        console.log('Consuming Player service and received maeesage');
    });
});

//App should apply Authorization header to all requests
//To simplify the code we will use a middleware to check the header with a secret key.
//Ideally we should be using a proper JWT or OAuth2 and a database to store user information.
app.use((req, res, next) => {
    const token = req.header('Authorization');
    if (token === process.env.SECRET_KEY) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
});
//Start the application listening on the port
app.listen(port,()  => {
    console.log(`Server started on port ${port}`);
});
module.exports = app;
