'use strict';
require('dotenv').config();

require('ejs');

const express = require('express');

const cors = require('cors')

const PORT = process.env.PORT || 3000;

const app = express();

const superagent = require('superagent');

const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
    res.render('./pages/searches/new')
})
app.get('/', (req, res) => {
    let SQL = 'SELECT * FROM booksData;'
    client.query(SQL)
        .then(results => {
            console.log('asdasdasdasdasdasdas', results.rows);
            res.render('./pages/index', { bookResults: results.rows });
        })
})
app.post('/book', bookSaver);
app.post('/searches', bookSearches);
app.get('/books/:id', getBooksDetails)

function bookSearches(req, res) {
    let newArr = [];

    let typeOfSearch = req.body.search[1];
    //     console.log('bewwwwwwwwwwwwwwwwwwwwwwwwwwwww', req.body.search)
    let searchQuery = req.body.search[0];
    searchQuery = searchQuery.replace(/\s/g, '%20');
    let url = `https://www.googleapis.com/books/v1/volumes?q=${searchQuery}`;
    if (typeOfSearch === 'title') {
        url += `+intitle:${searchQuery}`;
        //         console.log('this is the url tadaaaaaaaaaaaaaaaaaaaaa', url);
    }
    if (typeOfSearch === 'author') {
        url += `+inauthor:${searchQuery}`;
    }
    superagent.get(url)
        .then(bookData => {
            if (bookData.body.items) {
                bookData.body.items.forEach(data => {
                    let bookObj = new Book(data);
                    newArr.push(bookObj);
                })
                res.render('./pages/searches/show', { book: newArr });
            } else {
                res.render('./pages/errors', { book: newArr });
            }
        })
}

function Book(data) {
    this.title = data.volumeInfo.title || 'no title avilable';
    this.author = data.volumeInfo.authors || 'no author name avilable';
    this.summary = data.volumeInfo.description || 'no descriptions avilable';
    if (data.volumeInfo.imageLinks) {
        this.image_url = data.volumeInfo.imageLinks.thumbnail;
    } else {
        this.img = 'https://f0.pngfuel.com/png/981/958/black-and-white-square-illustration-computer-icons-book-symbol-book-now-button-png-clip-art.png';
    }

    if (data.volumeInfo.industryIdentifiers) {
        this.isbn = `${data.volumeInfo.industryIdentifiers[0].type}  ${data.volumeInfo.industryIdentifiers[0].identifier}`;
    } else {
        'no isbn avilable';
    }
}

function bookSaver(req, res) {
    let title = req.body.title;
    let author = req.body.author;
    let image_url = req.body.url;
    let description = req.body.description;
    let isbn = req.body.isbn;
    let bookshelf = req.body.bookshelf
    let SQL = `INSERT INTO booksData (title,author, image_url,description,isbn,bookshelf) VALUES ($1,$2,$3,$4,$5,$6);`
    let safeValue = [title, author, image_url, description, isbn, bookshelf];
    return client.query(SQL, safeValue)
        .then(() => {
            res.redirect(`/`);
        })
}

function getBooksDetails(req, res) {
    let SQL = 'SELECT * FROM booksData WHERE id=$1;';
    let values = [req.params.id];
    return client.query(SQL, values)
        .then(result => {
            res.render('pages/books/detail', { book: result.rows[0] });
        })
}
app.use('*', (request, response) => {
    response.render('pages/errors');
})

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`listening on PORT ${PORT} `)
        })
    })