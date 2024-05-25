
import React, {useState, useEffect} from "react";
import EHRapi from './api';
import { useNavigate, useParams} from "react-router-dom";
import EHRApi from "./api";

// Only for PCP
function AppointmentForm({setIsLogged}) {

       // Parem extraction
       const {pid} = useParams()
       const [patient, setPatient] = useState({});


       useEffect(() => {
        const fetchPatient = async () => {
          try {
            const patientData = await EHRApi.getPatient(pid);
            setPatient(patientData);
          } catch (err) {
            console.error('Failed to fetch patient data:', err);
            setError('Failed to fetch patient data');
          } 
        };
    
        fetchPatient();
      }, [pid]);

  const navigate = useNavigate();

  // Used for clearing form 
  const INITIAL_STATE = { datetime: "", password: "", firstName: "", lastName: "",email: "",invitationCode:"" };

    // state for form input
    const [formData, setFormData] = useState(INITIAL_STATE);

    // matches input value to what was typed
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value})
    };

    // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
            const token = await EHRApi.make(formData);
            setIsLogged(token); 
            localStorage.setItem('token', token)
            navigate("..", { relative: "path" })

          } catch (error) {
            console.error('Error registering:', error);
          }
      setFormData(INITIAL_STATE)
    };
  
    return (
      <form onSubmit={handleSubmit} >
        <h1>Make appointment for {patient.firstName}!</h1>

        <label htmlFor="datetime">Date and Time</label>
      <input
        type="datetime-local"
        id="datetime"
        name="datetime"
        value={formData.datetime}
        onChange={handleChange}
        step="1800" 
      />

        <label htmlFor="password" >Password</label>
        <input
        id="password"
        name="password"
        placeholder="password"
        value={formData.password}
        onChange={handleChange}
      />

<label htmlFor="firstName" >First name</label>
        <input
        id="firstName"
        name="firstName"
        placeholder="First name"
        value={formData.firstName}
        onChange={handleChange}
      />

<label htmlFor="lastName" >Last name</label>
        <input
        id="lastName"
        name="lastName"
        placeholder="Last name"
        value={formData.lastName}
        onChange={handleChange}
      />

<label htmlFor="email" >Email</label>
        <input
        id="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

<label htmlFor="invitationCode" >HCP code</label>
        <input
        id="invitationCode"
        name="invitationCode"
        placeholder="Code"
        value={formData.invitationCode}
        onChange={handleChange}
      />

        <button type="submit">Sign up!</button>
      </form>
    );
  }
  
// end

export default AppointmentForm
