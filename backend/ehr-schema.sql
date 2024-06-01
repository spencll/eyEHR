CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE,
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE CHECK (position('@' IN email) > 1),
  is_HCP BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE CHECK (position('@' IN email) > 1)
);

CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    datetime TIMESTAMP NOT NULL,
    user_id INT NOT NULL,
    patient_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE encounters(
    id SERIAL PRIMARY KEY,
    datetime TIMESTAMP NOT NULL,
    user_id INT NOT NULL,
    patient_id INT NOT NULL,
    results JSONB,
    signed BOOLEAN DEFAULT FALSE,
    signed_by VARCHAR(255) DEFAULT NULL,
    signed_at TIMESTAMP DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

