'use strict';

// ========== Dependencies ========== //
const express = require('express');
const methodOverride = require('method-override');
const pg = require('pg');
const superagent = require('superagent');

// ========== Environment Variable ========== //
require('dotenv').config();

// ========== Server ========== //
const app = express();
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
// render search form
app.get('/searches/new', renderForm);
// render search results from Google Book API
app.post('/searches', searchBooks);
// add a new book to database and redirect to Home page
app.get('/books/save/:book_index', addBooksToDB);
// select a book on Home page to show a detail view
app.get('/books/detail/:book_id', viewOneBook);

// ========== Catch All Other Routes ========== //
app.get('*', (request, response) => response.status(404).render('pages/error'));

// ========== Render Views ========== //
function renderForm(request, response){
  response.render('pages/searches/new');
}

// ========== Get Data From Database ========== //
function myBookshelf(request, response){
  let sql = 'SELECT * FROM books;';
  client.query(sql)
    .then(results => response.render('pages/index', {data: results.rows}))
    .catch(error => errorHandler(error, request, response));
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
      console.log('ISBN', superagentResults.body.items[0].volumeInfo.industryIdentifiers[0]);
      // Set i = -1 for now, when a new search result is rendered, a temp id "i" is assigned to each of the result. We use this temp id for request.params so we know which one to save to db.
      let i = -1;
      // For all the return results, map through each of them and make a new Book object
      return superagentResults.body.items.map(book => {
        i++;
        // pass search result object and temp id to constructor function
        return new Book(book.volumeInfo, i);
      })
    })
    .then(result => {
      bookArray = result;
      response.render('pages/searches/show.ejs', {data: result});
    })
    .catch(error => errorHandler(error, request, response));
}

// ========== Save a New Book in Database ========== //
// All the search results are saved here in bookArray ready for us to grab and save to db.
let bookArray = [];
function addBooksToDB(request, response){
  // This is the index number for the book that is clicked to be added
  const bookIndex = request.params.book_index;
  console.log(bookIndex);
  let sql = 'INSERT INTO books (author, title, isbn, image_url, descriptions, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [bookArray[bookIndex].author, bookArray[bookIndex].title, bookArray[bookIndex].isbn, bookArray[bookIndex].image_url, bookArray[bookIndex].descriptions, bookArray[bookIndex].bookshelf];
  client.query(sql, values)
    .then(response.redirect('/'))
    .catch(error => errorHandler(error, request, response));
}

// ========== View a book in a detailed view ========== //
function viewOneBook(request, response){
  let sql = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];
  client.query(sql, values)
    .then(result => response.render('pages/books/detail', {book: result.rows[0]}))
    .catch(error => errorHandler(error, request, response));
}

// ========== Book Constructor Object ========== //
function Book(infoFromAPI, i){
  const placeholderImg = 'https://i.imgur.com/J5LVHEL.jpg';
  let imgLink = infoFromAPI.imageLinks.thumbnail.replace(/^http:/, 'https:');
  let isbnData = infoFromAPI.industryIdentifiers[0];
  this.author = infoFromAPI.authors[0] ? infoFromAPI.authors[0] : 'no author available';
  this.title = infoFromAPI.title ? infoFromAPI.title : 'no title available';
  this.isbn = isbnData.type + isbnData.identifier ? isbnData.type + isbnData.identifier : 'no ISBN available';
  this.descriptions = infoFromAPI.descriptions ? infoFromAPI.descriptions : 'no description available';
  this.image_url = imgLink ? imgLink : placeholderImg;
  this.tempId = i;
}

// ========== Error Function ========== //
function errorHandler(error, request, response){
  console.error(error);
  response.status(500).render('pages/error');
}

// ========== Listen on PORT ==========
app.listen(PORT, () => console.log(`listening on port ${PORT}`));
