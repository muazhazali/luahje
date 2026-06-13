-- Create messages table with UUID primary key
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient VARCHAR(50) NOT NULL,
    body TEXT NOT NULL,
    color VARCHAR(7) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient sorting by creation date
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
