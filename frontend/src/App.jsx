import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import NavBar from './NavBar';
import './App.css'
import Home from './Home';
import EHRApi from './api';
import AppointmentsList from './AppointmentsList';
import EncountersList from './EncountersList';
// Forms
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
import AppointmentForm from './AppointmentForm';
import EncounterForm from './EncounterForm';


import PatientProfile from './PatientProfile';
// import CompanyDetails from './CompanyDetails';
import Profile from './Profile';
// import JobDetails from './JobDetails';
import { Navigate } from 'react-router-dom';

function App() {

  // Checks local storage for existing token 
  let token = localStorage.getItem('token')

    // States /////////////////////////////////////////////////////////
    const [isLoading, setIsLoading] = useState(true);

    // Stores existing token into isLogged
    const [isLogged, setIsLogged] = useState(token)
    
    // The actual user info 
    const [userInfo, setUserInfo] = useState({})

    // Appointment state, today's apppointments for HCP, all apointments for regular user. Can then query via front end
    const [appointments, setAppointments] = useState([])  

    // Encounter state, unassigned encounters for HCP, all encounters for regular user. Can then query via front end
    const [encounters, setEncounters] = useState([])  


  
    const fetchUserData = async () => {
      // token verification-> username -> getUser
      try {
          if (isLogged) {
            // Getting username from payload 
           const { username } = jwtDecode(isLogged);
          //  API requests
          const user = await EHRApi.getUser(username);
          const appointments = await EHRApi.getAppointments(username)
          const encounters = await EHRApi.getEncounters(username)
          // Setting states 

          setAppointments(appointments)
          setUserInfo(user)
          }

      } catch (error) {
          console.error('Error fetching data:', error);
      }
  };

    useEffect(() => {
      async function pullfromDB() {
        setIsLoading(false);
        fetchUserData()
      }
    
      pullfromDB();
    }, [isLogged]);

    if (isLoading) {
      return <p>Loading &hellip;</p>;
    }

//  Logout, remove everything and token 
  function logout() {
    setIsLogged(null);
    setUserInfo({})
    localStorage.removeItem('token');
  }




  return (
    <>
   <Router>
   <NavBar isLogged={isLogged} logout={logout} userInfo={userInfo}/>
      <Routes>
      <Route exact path="/" element={<Home userInfo={userInfo} isLogged={isLogged} />} />
      {/* Protecting companies/jobs routes */}

      <Route exact path="/signup" element={<SignUpForm setIsLogged={setIsLogged}/>} />
      <Route exact path="/login" element={<LoginForm setIsLogged={setIsLogged}/>} />
      <Route exact path="/profile" element={<Profile isLogged={isLogged}/> }  />  
      <Route exact path="/patients/:pid" element={<PatientProfile isLogged={isLogged} /> }  />  
      <Route exact path="/appointments" element={isLogged? <AppointmentsList appointments={appointments} />: <Navigate to="/login"/>}/>
      <Route exact path="/patients/:pid/appointments/new" element={isLogged? <AppointmentForm appointments={appointments} />: <Navigate to="/login"/>}/>
      <Route exact path="/encounters" element={isLogged? <EncountersList encounters={encounters} />: <Navigate to="/login"/>}/>

      

        {/* <Route exact path="/companies" element={isLogged? <CompaniesList companies={companies} setCompanies={setCompanies}/>: <Navigate to="/login"/>}/>
        <Route exact path="/jobs" element={isLogged?<JobsList jobs={jobs} setJobs={setJobs} setUserInfo={setUserInfo} userInfo={userInfo}/>:<Navigate to="/login"/>} />

        <Route path="/companies/:handle" element={<CompanyDetails/>} />
        <Route path="/jobs/:title" element={<JobDetails/>} />  */}
      </Routes>
    </Router>
    </>
  )
}

export default App
