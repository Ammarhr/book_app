DROP TABLE IF EXISTS booksData;

CREATE TABLE booksData (
	id SERIAL PRIMARY KEY,
	title VARCHAR(255),
	author VARCHAR(255),
	 image_url TEXT,
           description TEXT,
	 isbn TEXT,
	 bookshelf VARCHAR(50)
	 );