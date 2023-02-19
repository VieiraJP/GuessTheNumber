//The game needs to initiate the express framework
const express = require('express');
//The game needs to have a jwt token
const jwt = require('jsonwebtoken');
//The game needs to have a body parser
const bodyParser = require('body-parser');
const res = require("express/lib/response");
const Console = require("console");
//The game needs to have a router
const router = express.Router();

//declare  in-memory storage for the game ids.
const games = {};

//Endpoint to initiate a game with authentication and sign a game id to the client
router.post('/init', (req, res) => {
    const gameId = Math.random().toString(36).substring(2, 8); // Generate a random 8-character game ID, nice to have a short ID for testing
    const randomNumber = Math.floor(Math.random() * 10000) + 1; // Generate a random number between 1 and 10000
    //Log the game id and Random number
    console.log("Game ID: " + gameId);
    console.log("Random Number to be guessed: " + randomNumber);
    games[gameId] = { number: randomNumber, finished: false }; // Store the game in memory with the game ID as key and the random number as value for the guess and a boolean to check if the game is finished
    res.json({ id: gameId }); // Send the game ID back to the client with the response
});

//Endpoint to receive a guess from the client it does require the gameID an authenticated client
router.post('/guess/:gameId', (req, res) => {
    const { gameId } = req.params;
    const { guess } = req.body;
    if (!guess) {
        return res.status(400).send('Missing guess in the request body');
    }
    const game = games[gameId];
    if (!game) {
        return res.status(404).send('Game not found');
    }
    if (game.finished) {
        return res.status(400).send('Game already finished');
    }
    const number = game.number;
    const guessToCompare = parseInt(guess.numberToGuess);
    if (guessToCompare === number) {
        game.finished = true;
        return res.send('correct');
    } else if (guessToCompare < number) {
        return res.send('smaller');
    } else if (guessToCompare > number) {
        return res.send('larger');
    }else {
        return res.send('Something went wrong');
    }
})

// Endpoint to finish the game and clean up the data
router.delete('/:id', (req, res) => {
    const gameId = req.params.id;
    const game = games[gameId];
    if (!game) {
        //Respond with 404 Not Found
        return res.status(404).send('Game not found');
    }
    delete games[gameId];
    //Respond with 204 No Content
    res.status(204).send();
});


//export the router
module.exports=router;



