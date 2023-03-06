require('dotenv').config(); // require .env file for environment variables
const express = require('express'); //require express
const axios = require('axios');
const amqp = require("amqplib"); ////require axios for http requests


//This is the routes file for the client service
const router = express.Router();



const CORRECT = 'correct';
const SMALLER = 'smaller';
const LARGER = 'larger';

let isGameInitiated=false;
let currentGameId=0;
let channel;
let connection;

// RabbitMQ connection
async function connect() {
    try {
         connection = await amqp.connect(process.env.RABBITMQ_URL);
         channel = await connection.createChannel();
        await channel.assertQueue('player');
    } catch (error) {
        console.error(error);
    }
}


async function binarySearchGame(headers,gameId, low, high) {
    const mid = Math.floor((low + high) / 2);
    const guessingNumber = { "guess": mid };

    //try catch block to catch errors
    try {
        // Send a guess to the game host service
        const response = await axios.post(GAME_URL + `/guess/${gameId}`, guessingNumber, {headers});
        const result = response.data;

        if (result === CORRECT) {
            console.log(`Found the number! It's ${mid}`);
            return mid;
        } else if (result === SMALLER) {
            console.log(`Guessing lower...`);
            return await binarySearchGame(headers,gameId, mid + 1, high);
        } else if (result === LARGER){
            console.log(`Guessing higher...`);
            return await binarySearchGame(headers,gameId, low, mid - 1);

        }else {
            return {"Something went wrong": result};

        }
    }catch (error){
        console.error(error.response);
        return {"Something went wrong": error.response.data};
        }

 //Compare the result with the guessing number

}

router.get('/initWithBinarySearch',async (req, res) => {
    try {
        // Initiate a new game
        const headers = { Authorization: req.headers.authorization };
        const response = await axios.post(GAME_URL+'/init', null, {headers});
        const gameId = response.data.id;

        // Start the binary search
        const result = await binarySearchGame(headers,gameId, 1, 10000);
        res.json({ result });
    } catch (error) {
        console.error(error.status);
        res.status(error.status).json({ message: error.message});
    }
});



router.post('/rabbit/', async (req, res) => {
    try {
        //Connect to RabbitMQ
        await connect();
        channel.sendToQueue(
            'player',
            new Buffer.from(
                JSON.stringify({ 'type': 'init ',
                    date: new Date(),
                }),
            ),
        )
        res.send('Game is initiating');
    } catch (error) {
        console.error(error.status);
    }
});


//Initiate a new game with
router.get('/init/', async (req, res) => {
    try {
        //Connect to RabbitMQ
        await connect();
        channel.sendToQueue(
            'player',
            new Buffer.from(
                JSON.stringify({ 'type': 'init ',
                    date: new Date(),
                }),
            ),
        )
        res.send('Game is initiating');

        const headers = { Authorization: req.headers.authorization };
        const response = await axios.post(GAME_URL+'/init', null, {headers});

        currentGameId = response.data.id;
        if(currentGameId!==0){
            isGameInitiated=true;
        }
        res.json({ "gameId":currentGameId });
    } catch (error) {
        console.error(error.status);
        res.send({ message: error.message});
    }
});

router.get('/game/:numberToGuess', async (req, res) => {
    try {
        const headers = { Authorization: req.headers.authorization };
        const numberToGuess  = req.params

        //Verify that the game is initiated
        if(!isGameInitiated || currentGameId===0){
            return res.send(`Please initiate a game first`);
        }

        // Send a guess to the game host service
        const guessResponse = await axios.post(GAME_URL+`/guess/${currentGameId}`, {"guess":numberToGuess},{headers});
        const result = guessResponse.data;
        if (result=== CORRECT) {
            console.log(`Found the number! You can now delete the game`);
            isGameInitiated=false;
            currentGameId=0
            return res.send(`Found the number!`);
        } else if (result === SMALLER) {
            console.log(`Guessing lower...`);
            return res.send(`Your Number is smaller than the number to guess`);
        } else if (result=== LARGER){
            console.log(`Guessing higher...`);
            return res.send(`Your Number is larger than the number to guess`);

        }else {
            return {"Something went wrong": result};

        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//Player service should be able to delete a game
router.delete('/delete/:gameId', async (req, res) => {
    //send a delete request to the game host service
    try {
        const headers = { Authorization: req.headers.authorization };
        const response = await axios.delete(GAME_URL + `/delete/${req.params.gameId}`, {headers});
        const result = response.data;
        if (result === "Game deleted") {
            console.log(`Game deleted`);
            return res.send(`Game deleted`);
        } else {
            return res.send(`Game not deleted`);
        }
    }catch (error) {
        console.error(error.status);
        return res.status(error.status).json({message: error.message});
    }
});


module.exports = router;