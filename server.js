'use strict';
require('dotenv').config();

require('ejs');

const express = require('express');

const cors = require('cors')

const PORT = process.env.PORT || 3000;

const app = express();

const superagent = require('superagent');


app.set('view engine', 'ejs');

app.use(express.static('./public'));

app.use(cors());

app.get('/', (req, res) => {
    res.render('./pages/index')
})

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/search', (req, res) => {
    res.render('./pages/searches/new')
})

app.post('/searches', bookSearches);

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
        .catch(error => res.render('pages/errors'));
}

function Book(data) {
    this.title = data.volumeInfo.title || 'no title avilable';
    this.author = data.volumeInfo.authors || 'no author name avilable';
    this.summary = data.volumeInfo.description || 'no description avilable';
    if (data.volumeInfo.imageLinks) {
        this.image_url = data.volumeInfo.imageLinks.thumbnail;
    } else {
        this.img = 'https://f0.pngfuel.com/png/981/958/black-and-white-square-illustration-computer-icons-book-symbol-book-now-button-png-clip-art.png';
    }
}


app.use('*', (request, response) => {
    response.render('pages/errors');
})

app.listen(PORT, () => {
    console.log(`listening on PORT ${PORT} `)
})