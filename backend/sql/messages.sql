-- Create a schema specifically for the message system
CREATE SCHEMA IF NOT EXISTS message_system;

-- Create a table for chat rooms
CREATE TABLE message_system.rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a unique constraint on room_name
ALTER TABLE message_system.rooms ADD CONSTRAINT unique_room_name UNIQUE (room_name);

-- Create a table for users
CREATE TABLE message_system.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,                  
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a partitioned table for messages
CREATE TABLE message_system.messages (
    message_id UUID NOT NULL,  -- Unique identifier for the message (part of the composite primary key)
    room_id UUID NOT NULL REFERENCES message_system.rooms(room_id),  -- Reference to the chat room (not null)
    user_id UUID NOT NULL REFERENCES message_system.users(user_id),  -- Reference to the user (not null)
    message TEXT NOT NULL,                                     -- The content of the message (not null)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  -- Timestamp of when the message was created
    PRIMARY KEY (message_id, created_at)  -- Composite primary key including message_id and created_at
) PARTITION BY RANGE (created_at);  -- Partitioning the table by the created_at timestamp

-- Partition for October 2024
CREATE TABLE message_system.messages_2024_10 PARTITION OF message_system.messages
FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

-- Partition for November 2024
CREATE TABLE message_system.messages_2024_11 PARTITION OF message_system.messages
FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

-- Partition for December 2024
CREATE TABLE message_system.messages_2024_12 PARTITION OF message_system.messages
FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- Partition for January 2024
CREATE TABLE message_system.messages_2024_01 PARTITION OF message_system.messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Partition for February 2024
CREATE TABLE message_system.messages_2024_02 PARTITION OF message_system.messages
FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');

-- Create indexes to optimize query performance for the main messages table
CREATE INDEX idx_messages_room_id ON message_system.messages (room_id, created_at DESC);
CREATE INDEX idx_messages_user_id ON message_system.messages (user_id, created_at DESC);
CREATE INDEX idx_messages_created_at ON message_system.messages (created_at DESC);

-- Create indexes for the October 2024 partition
CREATE INDEX idx_messages_2024_10_room_id ON message_system.messages_2024_10 (room_id, created_at DESC);
CREATE INDEX idx_messages_2024_10_user_id ON message_system.messages_2024_10 (user_id, created_at DESC);
CREATE INDEX idx_messages_2024_10_created_at ON message_system.messages_2024_10 (created_at DESC);

-- Create indexes for the November 2024 partition
CREATE INDEX idx_messages_2024_11_room_id ON message_system.messages_2024_11 (room_id, created_at DESC);
CREATE INDEX idx_messages_2024_11_user_id ON message_system.messages_2024_11 (user_id, created_at DESC);
CREATE INDEX idx_messages_2024_11_created_at ON message_system.messages_2024_11 (created_at DESC);

-- Create indexes for the December 2024 partition
CREATE INDEX idx_messages_2024_12_room_id ON message_system.messages_2024_12 (room_id, created_at DESC);
CREATE INDEX idx_messages_2024_12_user_id ON message_system.messages_2024_12 (user_id, created_at DESC);
CREATE INDEX idx_messages_2024_12_created_at ON message_system.messages_2024_12 (created_at DESC);

-- Create indexes for the January 2024 partition
CREATE INDEX idx_messages_2024_01_room_id ON message_system.messages_2024_01 (room_id, created_at DESC);
CREATE INDEX idx_messages_2024_01_user_id ON message_system.messages_2024_01 (user_id, created_at DESC);
CREATE INDEX idx_messages_2024_01_created_at ON message_system.messages_2024_01 (created_at DESC);

-- Create indexes for the February 2024 partition
CREATE INDEX idx_messages_2024_02_room_id ON message_system.messages_2024_02 (room_id, created_at DESC);
CREATE INDEX idx_messages_2024_02_user_id ON message_system.messages_2024_02 (user_id, created_at DESC);
CREATE INDEX idx_messages_2024_02_created_at ON message_system.messages_2024_02 (created_at DESC);
