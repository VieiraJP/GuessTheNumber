require('dotenv').config();

const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// API endpoint to initiate a new game
const INIT_GAME_URL = 'http://localhost:3000/init';

const isGameRunning=false;
let gameId=null;

async function binarySearchGame(headers,gameId, low, high) {
  const mid = Math.floor((low + high) / 2);
  const guess = { number: mid };

  // Send a guess to the game host service
  const response = await axios.post(`http://localhost:3000/guess/${gameId}`, {"guess":guess},{headers});
  const result = response.data;

  if (result === 'correct') {
    console.log(`Found the number! It's ${mid}`);
    return mid;
  } else if (result === 'smaller') {
    console.log(`Guessing lower...`);
    return await binarySearchGame(headers,gameId, mid + 1, high);

  } else {
    console.log(`Guessing higher...`);
    return await binarySearchGame(headers,gameId, low, mid - 1);

  }
}

// Route to start a new game and perform the binary search
app.get('/gameBinarySearch', async (req, res) => {
  try {
    // Initiate a new game

    const headers = { Authorization: req.headers.authorization };
    const response = await axios.post(INIT_GAME_URL, null, {headers});
    const gameId = response.data.id;

    // Start the binary search
    const result = await binarySearchGame(headers,gameId, 1, 10000);
    res.json({ result });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Route to start a new game without binary search
app.get('/game/:number', async (req, res) => {
  try {
    // Initiate a new game

    const headers = { Authorization: req.headers.authorization };
    const guess  = req.params

    if(gameId==null) {
      const gameIdResponse = await axios.post(INIT_GAME_URL, null, {headers});
      gameId = gameIdResponse.data.id;
    }
    // Send a guess to the game host service
    const guessResponse = await axios.post(`http://localhost:3000/guess/${gameId}`, {"guess":guess},{headers});
    res.json(guessResponse.data);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


app.listen(PORT, () => {
  console.log(`Player service running on port ${PORT}`);
});

//TODO: urls  to be changed to env variables
//TODO: add routes folder to simplify the code in app.js
