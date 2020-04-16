'use strict';

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT;
const server = express();
const client = new pg.Client(process.env.DATABASE_URL);
const methodOverride = require('method-override');


server.use(express.urlencoded({ extended: true }));
server.set('view engine', 'ejs');
server.use(express.static('./public'));
server.use(methodOverride('_method'));

// route
server.get('/', goToHomePage);
server.get('/searches/new', mainForm);
server.post('/searches', searchPage);
server.post('/', saveInDataBase);
server.get('/details/:book',detailsPage);
server.put('/update/:book',updateInDataBase);
server.delete('/delete/:book',deleteBook);



// all function
function goToHomePage(req, res) {
  let SQL = 'SELECT * FROM books;';
  client.query(SQL)
  .then(result =>{
    res.render('index',{data: result.rows});
  }); 
}

function mainForm(req, res) {
  res.render('new');
}
function searchPage(req, res) {
  let choice = req.body.choice;
  let select = req.body.select;
  let url = `https://www.googleapis.com/books/v1/volumes?q=in${select}:${choice}`;
  return superagent.get(url)
    .then(result => {
      let data = result.body.items;
      let array = data.map(val => {
        return new Book(val.volumeInfo);
      });
      res.render('show', { data: array });
    });
}


// save in database
function saveInDataBase(req, res) {
  let image = req.body.image;
  let title = req.body.title;
  let authors = req.body.authors;
  let description = req.body.description;
  let isbn = req.body.isbn;
  let bookshelf = req.body.bookshelf;
  if (!Array.isArray(authors)) {
    authors = [authors];
  }
  let SQL = 'INSERT INTO books (image, title,authors,description,isbn,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);';
  let safeValues = [image, title, authors, description, isbn, bookshelf];
  return client.query(SQL, safeValues)
    .then(() => {
      res.redirect('/');
    });
}

function detailsPage(req,res){
let buttonClicked = req.params.book;
let SQL = 'SELECT * FROM books WHERE id=$1;';
let safeValues = [buttonClicked];
return client.query(SQL,safeValues)
.then(result =>{
  let SQL2 = 'SELECT DISTINCT bookshelf FROM books;';
  client.query(SQL2)
  .then(bookshelf =>{
    res.render('detial',{data: result.rows[0],book: bookshelf.rows});
  })
});

}
function updateInDataBase(req,res){
  console.log('hihi');
  let buttonClicked = req.params.book;
  let title = req.body.title;
  let image = req.body.image;
  let authors = req.body.authors;
  let isbn = req.body.isbn;
  let bookshelf = req.body.bookshelf;
  let description = req.body.description;
  if (!Array.isArray(authors)) {
      authors = [authors];
  }
  let SQL = 'UPDATE books SET title=$1,image=$2,authors=$3,ISBN=$4,bookshelf=$5,description=$6 WHERE id=$7;';
  let safeValues = [title, image, authors, isbn, bookshelf, description, buttonClicked];
  client.query(SQL, safeValues)
      .then(result => {
          detailsPage(req, res);
      });
}

function deleteBook(req,res){
    let bookId = req.params.book;
    let SQL = 'DELETE FROM books WHERE id=$1;';
    let safeValues = [bookId];
    client.query(SQL, safeValues)
        .then(() => {
          goToHomePage(req, res);
        }).catch(error => {
            console.log(error);
        });
}


//constructor function
function Book(data) {
  this.image = data.imageLinks.thumbnail || 'https://www.programmableweb.com/wp-content/protocols13.jpg';
  this.title = data.title || 'title';
  this.authors = data.authors || [];
  this.description = data.description || 'no description';
  this.isbn = data.industryIdentifiers[0].type + ' ' + data.industryIdentifiers[0].identifier || 'no isbn';
}




client.connect()
.then(() =>{
  server.listen(PORT, () => {
    console.log(`listen to ${PORT}`);
  });

});



