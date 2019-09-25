'use strict';

// ========== Dependencies ==========
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');
require('dotenv').config();

// ========== Server ==========
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ========== App Middleware ==========
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

// ========== Set Views Engine for Templating ==========
app.set('view engine', 'ejs');

// ========== Routes ==========
// declare a function renderHomePage that renders search form
app.get('/', renderHomePage);

// declare a function searchBooks that runs Google Book API
app.post('/searches', searchBooks);

// ========== Catch All Other Routes ==========
app.get('*', (request, response) => response.status(400).send('This route does not exist'));


// ========== Google Book API Functions ==========
function renderHomePage(request, response){
  response.render('pages/index');
}

function searchBooks(request, response){
  // Set up Google Book API to be used for superagent
  console.log(request.body.search);
  const searchName = request.body.search;
  const searchBy = request.body.type;

  let url = `https://www.googleapis.com/books/v1/volumes?q=`;
  if(searchBy === 'title'){
    console.log('search by book title')
    url = url + `intitle:${searchName}`;
  }
  if(searchBy === 'author'){
    console.log('search by book author')
    url = url + `inauthor:${searchName}`;
  }

  // Run superagent to Google Book API
  superagent.get(url)
    .then(superagentResults => {
      console.log(superagentResults.body.items);
      // For all the return results, map through each of them and make a new Book object
      const bookList = superagentResults.body.items.map(book => {
        return new Book(book.volumeInfo);
      })
      console.log(bookList);
      // response.send(bookList);
      response.render('pages/searches/show.ejs', {data:bookList});
    })
    .catch(error => {
      errorHandler(error, request, response);
    });
}

// ========== Book Constructor Object ==========
function Book(infoFromAPI){
  const placeholderImg = 'https://i.imgur.com/J5LVHEL.jpg';
  let imgLink = infoFromAPI.imageLinks.thumbnail.replace(/^http:/, 'https:');
  this.author = infoFromAPI.authors ? infoFromAPI.authors : 'no author available';
  this.title = infoFromAPI.title ? infoFromAPI.title : 'no title available';
  this.description = infoFromAPI.description ? infoFromAPI.description : 'no description available';
  this.imgUrl = imgLink ? imgLink : placeholderImg;
}

// ========== Error Function ==========
function errorHandler(error, request, response){
  console.error(error);
  response.status(500).send('Something went wrong');
}

// ========== Listen on PORT ==========
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
