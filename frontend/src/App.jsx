import {Route, Routes} from "react-router-dom";
import {useState, useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import NavBar from "./NavBar/NavBar";
import "./App.css";
import Home from "./Home";
import EHRApi from "./api";
import AppointmentsList from "./AppointmentList/AppointmentsList";
import EncountersList from "./EncounterListDetails/EncountersList";

// Forms
import SignUpForm from "./Auth/SignupForm";
import LoginForm from "./Auth/LoginForm";
import AppointmentForm from "./AppointmentForms/AppointmentForm";
import EncounterForm from "./EncounterForms/EncounterForm";
import PatientForm from "./NewPatientForm/PatientForm";

import PatientProfile from "./PatientDetails/PatientProfile";
import EncounterDetails from "./EncounterListDetails/EncounterDetails";

import Profile from "./EditUserForm/Profile";

import {Navigate} from "react-router-dom";
import CreateEncounter from "./EncounterForms/CreateEncounter";
import EditAppointment from "./AppointmentForms/EditAppointment";

function App() {
  // Checks local storage for existing token
  let token = localStorage.getItem("token");

  //Loading state, set to false when loading done 
  const [isLoading, setIsLoading] = useState(true);

  // Stores existing token into isLogged, maintains logged in state
  const [isLogged, setIsLogged] = useState(token);

  // The actual user info, pulled from local storage if it exists. 
  const [userInfo, setUserInfo] = useState(() => {
    const savedUserInfo = localStorage.getItem("user");
    return savedUserInfo ? JSON.parse(savedUserInfo) : {};
  });

  // Appointment state, today's apppointments for HCP, all apointments for regular user. 
  const [appointments, setAppointments] = useState([]);

  // Encounter state, unassigned encounters for HCP, all encounters for regular user. 
  const [encounters, setEncounters] = useState([]);

  // Helps reload pages after changes such as deletes 
  const [refresh, setRefresh] = useState(false);

  const fetchUserData = async () => {
    // token verification-> username -> get user info/appointments/encounters
    try {
      if (isLogged) {
        // Getting username from payload
        const {username} = jwtDecode(isLogged);
        //  API requests
        const user = await EHRApi.getUser(username);
        const appointments = await EHRApi.getAppointments(username);
        const encounters = await EHRApi.getEncounters(username);

        // Setting states
        setAppointments(appointments);
        setEncounters(encounters);
        setUserInfo(user);

        // Helps deal with page refreshes, userinfo stays active
        // Useful since some html elements depends on userinfo state
        localStorage.setItem("user", JSON.stringify(user));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // If logged in status or refresh status changes, rerender
  useEffect(() => {
    async function pullfromDB() {
      fetchUserData();
      setIsLoading(false);
    }

    pullfromDB();
  }, [isLogged, refresh]);

  // Wait until states are ready to render components
  if (isLoading) {
    return <p>Loading &hellip;</p>;
  }

  //  Logout, reset states and empty local storage 
  function logout() {
    setIsLogged(null);
    setUserInfo({});
    localStorage.clear();
  }

  // Datetime formatting
  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    const date = dateObj.toLocaleDateString(); // Extract date
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }); // Extract time
    return {date, time};
  };

  return (
    <>
      
      <NavBar
        isLogged={isLogged}
        logout={logout}
        userInfo={userInfo}
      />

      <Routes>
        <Route
          exact
          path="/"
          element={
            <Home
              userInfo={userInfo}
              isLogged={isLogged}
              formatDateTime={formatDateTime}
            />
          }
        />
        <Route
          exact
          path="/signup"
          element={
            <SignUpForm
              setIsLogged={setIsLogged}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          }
        />
        <Route
          exact
          path="/login"
          element={
            <LoginForm
              setIsLogged={setIsLogged}
              isLogged={isLogged}
              refresh={refresh}
              setRefresh={setRefresh}
            />
          }
        />

        {/* Users routes */}
        <Route
          exact
          path="/profile"
          element={
            isLogged ? (
              <Profile
                isLogged={isLogged}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          exact
          path="/appointments"
          element={
            isLogged ? (
              <AppointmentsList
                appointments={appointments}
                userInfo={userInfo}
                formatDateTime={formatDateTime}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          exact
          path="/encounters"
          element={
            isLogged ? (
              <EncountersList
                encounters={encounters}
                formatDateTime={formatDateTime}
                refresh={refresh}
                setRefresh={setRefresh}
                userInfo={userInfo}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Patient routes */}
        <Route
          exact
          path="/patients/add"
          element={
            userInfo.isHCP ? (
              <PatientForm
                isLogged={isLogged}
                userInfo={userInfo}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          exact
          path="/patients/:pid"
          element={
            isLogged ? (
              <PatientProfile
                isLogged={isLogged}
                userInfo={userInfo}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          exact
          path="/patients/:pid/appointments/new"
          element={
            isLogged ? (
              <AppointmentForm
                userInfo={userInfo}
                setAppointments={setAppointments}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          exact
          path="/patients/:pid/appointments/:aid/edit"
          element={
            isLogged ? (
              <EditAppointment
                userInfo={userInfo}
                setAppointments={setAppointments}
                refresh={refresh}
                setRefresh={setRefresh}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          exact
          path="/patients/:pid/encounters/new"
          element={
            isLogged ? (
              <CreateEncounter
                userInfo={userInfo}
                setEncounters={setEncounters}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Protected in the component, redirects to encounter detail if not HCP */}
        <Route
          exact
          path="/patients/:pid/encounters/:eid/edit"
          element={isLogged ? <EncounterForm userInfo={userInfo} /> : <Navigate to="/login" />}
        />

        <Route
          exact
          path="/patients/:pid/encounters/:eid"
          element={isLogged ? <EncounterDetails userInfo={userInfo} /> : <Navigate to="/login" />}
        />
      </Routes>
  
    </>
  );
}

export default App;
