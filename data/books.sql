DROP TABLE IF EXISTS books;

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    author VARCHAR(255),
    title VARCHAR(255),
    isbn VARCHAR(255),
    image_url TEXT,
    descriptions TEXT,
    bookshelf TEXT
);

INSERT INTO books (author, title, isbn, image_url, descriptions, bookshelf) VALUES ('Jane Austin', 'Persuasion', 'ISBN_139788180320750', 'https://books.google.com/books/content?id=IG6yDgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'Jane Austins final novel is her most mature and wickedly satirical. It follows the story of Anne Elliott, who as a teenager, was engaged to a seemingly ideal man—Frederick Wentworth. But after being persuaded by her friend Lady Russell that he is too poor to be a suitable match, Anne ends their engagement. When they are reacquainted eight years later, their circumstances are transformed—Frederick is returning triumphantly from the Napoleonic War, while Annes fortunes are floundering.', 'Favorite');

INSERT INTO books (author, title, isbn, image_url, descriptions, bookshelf) VALUES ('Carl Sagan', 'Cosmos', 'ISBN_139780307800985', 'https://books.google.com/books/content?id=EIqoiww1r9sC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api', 'Cosmos is one of the bestselling science books of all time. In clear-eyed prose, Sagan reveals a jewel-like blue world inhabited by a life form that is just beginning to discover its own identity and to venture into the vast ocean of space. Cosmos retraces the fourteen billion years of cosmic evolution that have transformed matter into consciousness, exploring such topics as the origin of life, the human brain, Egyptian hieroglyphics, spacecraft missions, the death of the Sun, the evolution of galaxies, and the forces and individuals who helped to shape modern science. ', 'To Read');