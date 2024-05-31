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
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE encounter_signatures (
    id SERIAL PRIMARY KEY,
    encounter_id INT NOT NULL,
    signed_by VARCHAR(255) NOT NULL,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (encounter_id) REFERENCES encounters(id)
);