CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  recipient TEXT NOT NULL,
  body TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS messages_created_at_idx ON messages (created_at DESC);
