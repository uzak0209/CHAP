CREATE TABLE
    IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        pass VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        lat INTEGER DEFAULT 0,
        lng INTEGER DEFAULT 0,
    );

CREATE TABLE
    IF NOT EXISTS thread (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        lat INTEGER DEFAULT 0,
        lng INTEGER DEFAULT 0,
    );

CREATE TABLE
    IF NOT EXISTS thread_comments (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL REFERENCES thread (thread_id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        lat INTEGER DEFAULT 0,
        lng INTEGER DEFAULT 0,
    );
CREATE TABLE 
    IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users (id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        lat INTEGER DEFAULT 0,
        lng INTEGER DEFAULT 0,
        like_count INTEGER DEFAULT 0,
    );