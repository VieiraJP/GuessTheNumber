require('dotenv').config(); // require .env file for environment variables
const express = require('express'); //require express
const amqp = require("amqplib");

const app = express(); //Initiate application
// port where the service will run
const PORT = 8080

let connection;
let sender_channel
let receiver_channel;
const queue1 = 'Sender';
const queue2 = 'Receiver';


// RabbitMQ connection
async function connect() {
  try {
    // Connect to RabbitMQ server
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    console.log('Connected to RabbitMQ server');

    // Create channels
    sender_channel = await connection.createChannel();
    receiver_channel = await connection.createChannel();

    // Assert Queues
    await sender_channel.assertQueue(queue1, { durable: true });
    await receiver_channel.assertQueue(queue2, { durable: true });

  } catch (error) {
    console.error(error);
  }
}

app.get('/', async (req, res) => {
  try {
    sender_channel.sendToQueue(
        queue1,
        new Buffer.from(
            JSON.stringify({ 'Message': 'Sending Message to RabbitMQ ',
              date: new Date(),
            }),
        ),
    )
    res.send('End point / has been reached and message sent');
  } catch (error) {
    console.error(error.status);
    res.send(`Error has happened reaching the / path and sending message ${error.status}`);
  }
});

//Initiate RabbitMQ instance
connect().then(() => {
  receiver_channel.consume(queue1, msg => {
    console.log(`Consuming ${queue1} service and received message: ${msg.content.toString()}`);
    receiver_channel.ack(msg)})});// Send a message to queue


// Consume from queue2
app.listen(PORT,() => {
  console.log(`Sender service in now running on port ${PORT}`);
});

module.exports = app;