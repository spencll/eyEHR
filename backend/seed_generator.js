// Prepares seed file for SQL by fetching randomuser API

const fs = require('fs');
const axios = require('axios')

let API_URL= 'https://randomuser.me/api/?nat=us&results=10&inc=name,email,cell,dob'
axios.get(API_URL)
  .then(response => {

    // Array of fake profiles
    let resp = response.data.results

// Define the table name
const tableName = 'patients';

// Stuff to insert 
const insertValues = resp.map(({ name, email }) => `('${name.first}', '${name.last}', '${email}')`).join(', ');

// The actual statement 
const insertStatement = `INSERT INTO ${tableName} (firstname, lastname, email) VALUES ${insertValues};`;

// Write SQL content to a file
fs.writeFileSync('seed_data.sql', insertStatement);

console.log('SQL file generated successfully');

  })

  .catch(error => {
    // Handle error
    console.error('Error fetching data:', error);
  });


