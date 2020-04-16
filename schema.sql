DROP TABLE IF EXISTS books;

CREATE TABLE IF NOT EXISTS books(
id SERIAL PRIMARY KEY,
image VARCHAR(700),
title VARCHAR(500),
authors TEXT [],
description TEXT,
isbn VARCHAR(255),
bookshelf VARCHAR(255)
);

