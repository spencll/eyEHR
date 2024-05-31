
import React, {useState, useEffect} from "react";
import EHRApi from './api';
import { useNavigate, useParams} from "react-router-dom";

// Only for PCP
function AppointmentForm({setAppointments, userInfo}) {

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
  const INITIAL_STATE = { datetime: "", userId: userInfo.id, patientId: pid};

    // state for form input
    const [formData, setFormData] = useState(INITIAL_STATE);

    // continues to udpate formdata object 
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value})
    };

    // Make appointment and change appointment state 
    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
            await EHRApi.makeAppointment(pid, formData);
            const appointments = await EHRApi.getAppointments(username)
            setAppointments(appointments)
            navigate("../..", { relative: "path" })

          } catch (error) {
            console.error('Error making appointment:', error);
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
      />




        <button type="submit">Submit!</button>
      </form>
    );
  }
  
// end

export default AppointmentForm
