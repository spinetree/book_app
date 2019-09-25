'use strict';

// ========== Dependencies ========== //
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const ejs = require('ejs');
require('dotenv').config();

// ========== Server ========== //
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3001;

// ========== App Middleware ========== //
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));

// ========== Database Setup ========== //
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', error => console.log(error));

// ========== Set Views Engine for Templating ========== //
app.set('view engine', 'ejs');

// ========== Routes ========== //
// renders Home page that lists all database
app.get('/', myBookshelf);
// add new books to database and update Home page
app.post('/', addBooksToDB);
// render search form
app.get('/searches', renderForm);
// render search results from Google Book API
app.post('/searches', searchBooks);

// ========== Catch All Other Routes ========== //
app.get('*', (request, response) => response.status(404).render('pages/error'));

// ========== Render Views ========== //
// function renderHomePage(request, response){
//   response.render('pages/index');
// }

function renderForm(request, response){
  response.render('pages/searches/new');
}

// ========== Google API Function ========== //
function searchBooks(request, response){
  // Set up Google Book API to be used for superagent
  console.log(request.body);
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
      console.log('THIS IS WHAT YOU ARE LOOKING FOR:', superagentResults.body.items[0].volumeInfo.industryIdentifiers[0]);
      // For all the return results, map through each of them and make a new Book object
      const bookList = superagentResults.body.items.map(book => {
        return new Book(book.volumeInfo);
      })
      response.render('pages/searches/show.ejs', {data:bookList});
    })
    .catch(error => errorHandler(error, request, response));
}

// ========== Save Search Results in Database ========== //
function addBooksToDB(request, response){
  let {author, title, isbn, image_url, descriptions, bookshelf} = request.body;
  let sql = 'INSERT INTO books (author, title, isbn, image_url, descriptions, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [author, title, isbn, image_url, descriptions, bookshelf];
  client.query(sql, values)
    .then(response.redirect('/'))
    .catch(error => errorHandler(error, request, response));
}

// ========== Get Data From Database ========== //
function myBookshelf(request, response){
  let sql = 'SELECT * FROM books;';
  client.query(sql)
    .then(results => response.render('pages/index', {data: results.rows}))
    .catch(error => errorHandler(error, request, response));
}

// ========== Book Constructor Object ========== //
function Book(infoFromAPI){
  const placeholderImg = 'https://i.imgur.com/J5LVHEL.jpg';
  let imgLink = infoFromAPI.imageLinks.thumbnail.replace(/^http:/, 'https:');
  let isbnData = infoFromAPI.industryIdentifiers[0];
  this.author = infoFromAPI.authors ? infoFromAPI.authors : 'no author available';
  this.title = infoFromAPI.title ? infoFromAPI.title : 'no title available';
  this.isbn = isbnData.type + isbnData.identifier ? isbnData.type + isbnData.identifier : 'no ISBN available';
  this.description = infoFromAPI.description ? infoFromAPI.description : 'no description available';
  this.imgUrl = imgLink ? imgLink : placeholderImg;
}

// ========== Error Function ========== //
function errorHandler(error, request, response){
  // console.error(error);
  response.status(500).send('something went wrong');
}

// ========== Listen on PORT ==========
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
