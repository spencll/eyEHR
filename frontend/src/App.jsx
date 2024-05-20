import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import NavBar from './NavBar';
import './App.css'
import Home from './Home';
import EHRApi from './api';
// import CompaniesList from './CompaniesList';
// import JobsList from './JobsList';
import SignUpForm from './SignupForm';
import LoginForm from './LoginForm';
// import CompanyDetails from './CompanyDetails';
import Profile from './Profile';
// import JobDetails from './JobDetails';
import { Navigate } from 'react-router-dom';

function App() {

  // Checks local storage for existing token 
  let token = localStorage.getItem('token')

    // States 
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState([]);

    // Stores existing token into isLogged
    const [isLogged, setIsLogged] = useState(token)
    
    // The actual user info 
    const [userInfo, setUserInfo] = useState({})

    const fetchUserData = async () => {
      // token verification-> username -> getUser
      try {
          if (isLogged) {
           const { username } = jwtDecode(isLogged);
          const user = await EHRApi.getUser(username);
          setUserInfo(user)
          }

      } catch (error) {
          console.error('Error fetching user data:', error);
      }
  };

    useEffect(() => {
      async function pullfromDB() {
        let users = await EHRApi.getAllUsers();
        setUsers(users)
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
