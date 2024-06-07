// Prepares seed file for SQL by fetching randomuser API

const fs = require('fs');
const axios = require('axios')

// Remove previous ehr-seed.sql file if it exists
const seedFilePath = 'ehr-seed.sql';
if (fs.existsSync(seedFilePath)) {
    fs.unlinkSync(seedFilePath);
    console.log('Previous ehr-seed.sql removed successfully');
}

// API request
let API_URL= 'https://randomuser.me/api/?nat=us&results=50&inc=name,email,cell,dob'

axios.get(API_URL)
  .then(response => {

    // Array of fake profiles
    let resp = response.data.results

// Define the table name
const tableName = 'patients';

    //Extracting just date from datetime 
    const formatDateTime = (datetime) => {
      const dateObj = new Date(datetime);
      const date = dateObj.toLocaleDateString(); 
      return date;
    };

// Stuff to insert 
const insertValues = resp.map(({ name, email, dob, cell }) => `('${name.first}', '${name.last}', '${email}', '${formatDateTime(dob.date)}', '${dob.age}', '${cell}')`).join(', ');

// The actual statement 
const insertStatement = `INSERT INTO ${tableName} (first_name, last_name, email, dob, age, cell) VALUES ${insertValues};`;

// Write SQL content to a file
fs.writeFileSync('ehr-seed.sql', insertStatement);

console.log('SQL file generated successfully');

  })

  .catch(error => {
    // Handle error
    console.error('Error fetching data:', error);
  });


