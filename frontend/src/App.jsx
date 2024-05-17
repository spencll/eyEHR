import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import NavBar from './NavBar';
import './App.css'
import Home from './Home';
import EHRApi from './api';
import CompaniesList from './CompaniesList';
import JobsList from './JobsList';
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
import CompanyDetails from './CompanyDetails';
import Profile from './Profile';
import JobDetails from './JobDetails';
import { Navigate } from 'react-router-dom';

function App() {

 
  let token = localStorage.getItem('token')

    // States 
    const [isLoading, setIsLoading] = useState(true);
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([])  

    // Basically just stores the token if existing into isLogged
    const [isLogged, setIsLogged] = useState(token)
    
    // The actual user info 
    const [userInfo, setUserInfo] = useState({})

    const fetchUserData = async () => {
      // token -> username -> getUser. Need token for authorization
      try {
          if (isLogged) {
           const { username } = jwtDecode(isLogged);
          JoblyApi.token = isLogged;
          const userInfo = await JoblyApi.getUser(username);
          setUserInfo(userInfo)
          }

      } catch (error) {
          console.error('Error fetching user data:', error);
      }
  };

    // First render, load companies, jobs, user info.
    useEffect(() => {
      async function pullfromDB() {
        let companies = await EHRApi.getAllCompanies();
        let jobs = await JoblyApi.getAllJobs();
        setJobs(jobs);
        setCompanies(companies);
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
   <NavBar isLogged={isLogged} logout={logout}/>
      <Routes>
      <Route exact path="/" element={<Home userInfo={userInfo} isLogged={isLogged}/>} />
      {/* Protecting companies/jobs routes */}
        <Route exact path="/companies" element={isLogged? <CompaniesList companies={companies} setCompanies={setCompanies}/>: <Navigate to="/login"/>}/>
        <Route exact path="/jobs" element={isLogged?<JobsList jobs={jobs} setJobs={setJobs} setUserInfo={setUserInfo} userInfo={userInfo}/>:<Navigate to="/login"/>} />

        <Route exact path="/signup" element={<SignUpForm setIsLogged={setIsLogged}/>} />
        <Route exact path="/login" element={<LoginForm setIsLogged={setIsLogged}/>} />
        <Route path="/companies/:handle" element={<CompanyDetails/>} />
        <Route path="/jobs/:title" element={<JobDetails/>} />
        <Route exact path="/profile" element={<Profile isLogged={isLogged}/> }  /> 
      </Routes>
    </Router>
    </>
  )
}

export default App
