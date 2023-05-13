CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) NOT NULL,
  password VARCHAR(50) NOT NULL,
  email VARCHAR(50) NOT NULL UNIQUE,
  device_token VARCHAR(100) NOT NULL UNIQUE,
  active_notifications BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  body TEXT NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL
);

CREATE TABLE plantations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  autowatering BOOLEAN NOT NULL DEFAULT false,
  healthy BOOLEAN NOT NULL DEFAULT true,
  name VARCHAR(50) NOT NULL,
  active_notifications BOOLEAN NOT NULL DEFAULT false,
  readings JSON NOT NULL
);
