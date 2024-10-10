-- Create a schema specifically for the message system
CREATE SCHEMA IF NOT EXISTS message_system;

-- Create a table for chat rooms
CREATE TABLE message_system.rooms (
    room_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add a case-insensitive unique constraint on room_name
ALTER TABLE message_system.rooms ADD CONSTRAINT unique_room_name UNIQUE (LOWER(room_name));

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


-- Global index on the partitioned table (instead of per-partition indexes)
CREATE INDEX idx_messages_room_id_global ON message_system.messages (room_id, created_at DESC);
CREATE INDEX idx_messages_user_id_global ON message_system.messages (user_id, created_at DESC);
CREATE INDEX idx_messages_created_at_global ON message_system.messages (created_at DESC);
