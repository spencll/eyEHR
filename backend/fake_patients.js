// Prepares seed file for SQL by fetching randomuser API

const fs = require('fs');
const axios = require('axios')

// Sample data extracted from the API response
const apiData = [
  { name: 'John Doe', email: 'john@example.com' },
  { name: 'Jane Smith', email: 'jane@example.com' }
  // Add more data as needed
];

axios.get('https://randomuser.me/api/?nat=us&results=10&inc=name,email,cell,dob')
  .then(response => {
    // Handle success

    // Array of fake profiles
    let resp = response.data.results


const insertStatements = resp.map(({ name, email }) => {
  return `INSERT INTO ${tableName} (firstname,lastname, email) VALUES ('${name.first}', '${name.last}', '${email}');`;
});
console.log(insertStatements)
//     Process the API response data here
  })
  .catch(error => {
    // Handle error
    console.error('Error fetching data:', error);
  });

// Define the table name
const tableName = 'users';

// Generate INSERT statements
// const insertStatements = apiData.map(({ name, email }) => {
//   return `INSERT INTO ${tableName} (name, email) VALUES ('${name}', '${email}');`;
// });

// // Combine INSERT statements into a single string
// const sqlContent = insertStatements.join('\n');

// // Write SQL content to a file
// fs.writeFileSync('seed_data.sql', sqlContent);

// console.log('SQL file generated successfully');
