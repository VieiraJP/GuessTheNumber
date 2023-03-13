//require .env file
require('dotenv').config();
//require express
const express = require('express');
//require body parser
const bodyParser = require('body-parser');

// require the Amqp library for the Queue.
const amqp = require("amqplib");

//Initiate application
const app = express();

//Add body parser to the application
app.use(bodyParser.json());

//Declare the port for the application to listen to.
//This can be any port you want. I am using 4000 for this example. You should perhaps declare this in the .env file.
const port =4000;

//Declare the RabbitMQ channel and connection
let connection;

let sender_channel
let receiver_channel;
const queue1 = 'Sender';
const queue2 = 'Receiver';


//Connection to the RabbitMQ server
async function connect() {
    try {
        // Connect to RabbitMQ server
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        // Create channel
        sender_channel = await connection.createChannel();
        receiver_channel = await connection.createChannel();

        // Assert Queues
        await sender_channel.assertQueue(queue1, { durable: true });
        await receiver_channel.assertQueue(queue2, { durable: true });
    } catch (error) {
        console.error(error);
    }
}
connect().then(() => {
    sender_channel.consume(queue1, msg => {
        console.log(`Consuming ${queue1} service and received message: ${msg.content.toString()}`);
        sender_channel.ack(msg)

        receiver_channel.sendToQueue(queue2,  new Buffer.from(
            JSON.stringify({ 'Message': 'Message has been received',
                date: new Date(),
            }),
        ));
    });
});

//Start the application listening on the port
app.listen(port,()  => {
    console.log(`Server started on port ${port}`);
});
module.exports = app;
