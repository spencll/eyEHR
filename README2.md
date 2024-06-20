# eyEHR

eyEHR is an electronic health records (EHR) system designed to streamline the management of patient data for eye care providers and provide patients with easy access to their own health records and appointments. Written in Javascript with backend using node.js/express and frontend using react with Vite as dev environment. Database populated with https://randomuser.me API. 

---

## Table of Contents

- [eyEHR](#eyehr)
  - [Table of Contents](#table-of-contents)
  - [General Features](#general-features)
  - [Added Features lacking in the EHR I use at work](#added-features-lacking-in-the-ehr-i-use-at-work)
  - [Installation](#installation)
    - [Clone repo:](#clone-repo)
    - [Setting up front end](#setting-up-front-end)
    - [Setting up back end](#setting-up-back-end)
  - [Usage](#usage)
  - [License](#license)
  - [Acknowledgements](#acknowledgements)

## General Features

- **Patient Management**: Add and view patient records.
- **Appointment Scheduling**: Manage appointments for patients.
- **Encounter Records**: Document and review patient encounters.
- **Universal User Authentication**: Secure login/signup for providers and patients.
- **Patient Search Functionality**: Search for patients in the database by name or DOB.
  
## Added Features lacking in the EHR I use at work

- **Continuous encounter updating**: Dynamic listener on encounter form inputs. Every change is automatically logged into the server rather than have to wait for page change to handle submit. My technicians often forget to hit "next" after inputing pre-testing data which then leaves the form empty. 
- **Home page showing unsigned encounters**: Work EHR requires querying for unsigned encounters. Why not just show all unsigned encounters on the home page to know what you have left to complete? Nothing left, go home, simple. 
- **Mobile friendly**: Not really too practical but it was an idea recommended by my mentor. Horizontal elements align vertically. Minimal effort but it works.


## Installation

### Clone repo:
```
git clone 
```
### Setting up front end
Navigate to frontend folder and install dependencies:
```sh
cd frontend
npm install
```

### Setting up back end

Navigate to backend folder, install dependencies, and run seed generator: 
```sh
cd backend
npm install
node seed_generator.js
```

Creating/seeding db:
```
psql < ehr.sql
```


## Usage

1. Start the development server/deploy frontend:
    ```sh
    cd backend
    npm run dev-full
    ```
2. Open your browser and go to `http://localhost:5173`.



## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Thanks to Springboard for providing software development fundamentals and mentor Daniel Pan for guidance. Also thanks to JesseB for technical assistance. 

