//The game needs to initiate the express framework
const express = require('express');
//The game needs to have authentication
const passport = require('passport');
//The game needs to have a jwt token
const jwt = require('jsonwebtoken');
//The game needs to have a body parser
const bodyParser = require('body-parser');
const res = require("express/lib/response");
const req = require("express/lib/request");
//The game needs to have a router
const router = express.Router();

//declare  in-memory storage for the game ids.
const games = {};

//declare the secret key
const secretKey = process.env.SECRET_KEY;

function next(err, user,info) {
    if (err) { return res.status(500).json({ message: err.message }); }
    if (!user) { return res.status(401).json({ message: info.message }); }

}

// Middleware to authenticate requests with JWT
const requireAuth = passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return next(user,info); }
    req.user = user;
    next();
});

//Endpoint to initiate a game with authentication and sign a game id to the client
router.post('/init', requireAuth, (req, res) => {
    const gameId = Math.random().toString(36).substring(2, 8); // Generate a random 8-character game ID, nice to have a short ID for testing
    const randomNumber = Math.floor(Math.random() * 10000) + 1; // Generate a random number between 1 and 10000
    games[gameId] = { number: randomNumber, finished: false }; // Store the game in memory with the game ID as key and the random number as value for the guess and a boolean to check if the game is finished
    res.json({ id: gameId }); // Send the game ID back to the client with the response
});

//Endpoint to receive a guess from the client it does require the gameID an authenticated client

router.post('/:id/guess', requireAuth, (req, res) => {
    const gameId = req.params.id;
    const guess = req.body;
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
    if (guess === number) {
        game.finished = true;
        return res.send('Correct');
    } else if (guess < number) {
        return res.send('Smaller');
    } else {
        return res.send('Larger');
    }
})

// Endpoint to finish the game and clean up the data
router.delete('/:id', requireAuth, (req, res) => {
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



