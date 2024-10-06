CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    room VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_room ON messages(room);

CREATE INDEX idx_messages_email ON messages(email);

CREATE INDEX idx_messages_timestamp ON messages(timestamp);