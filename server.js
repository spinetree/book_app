'use strict';

// ========== Dependencies ==========
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
require('dotenv').config();

// ========== Server ==========
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// ========== App Middleware ==========
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

// ========== Set Views Engine for Templating ==========
app.set('view engine', 'ejs');

// ========== Routes ==========
app.post('/', renderHomePage);
// declare a function renderHomePage that renders search form

// app.post('/searches', searchBooks);
// declare a function searchBooks that runs Google Book API

// ========== Catch All Other Routes ==========
app.get('*', (request, response) => response.status(400).send('This route does not exist'));


// ========== Functions ==========
function renderHomePage(request, response) {
  response.render('pages/index');
}






// ========== Error Function ==========
// function errorHandler(error, request, response){
//   console.error(error);
//   response.status(500).send('Something went wrong');
// }

// ========== Listen on PORT ==========
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
