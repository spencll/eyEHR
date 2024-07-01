import "./AppointmentForm.css";
import React, { useState, useEffect } from "react";
import EHRApi from "../api";
import { useNavigate, useParams } from "react-router-dom";

function AppointmentForm({ setRefresh, refresh, userInfo }) {

  // Parem extraction
  const { pid } = useParams();
  const [patient, setPatient] = useState({});

       // loading state
       const [loading, setLoading] = useState(true);
      
    

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const patientData = await EHRApi.getPatient(pid);
        setPatient(patientData);
        setLoading(false)
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError("Failed to fetch patient data");
      }
    };

    fetchPatient();
  }, [pid]);

  const navigate = useNavigate();

  // Initial state has user id and patient id ready to go, just need datetime filled
  const INITIAL_STATE = { datetime: "", userId: userInfo.id, patientId: pid };

  // state for form input
  const [formData, setFormData] = useState(INITIAL_STATE);

  // updates formdata to what was changed 
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Make appointment and change appointment state
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await EHRApi.makeAppointment(pid, formData);
      setRefresh(!refresh);
      navigate("../..", { relative: "path" });
    } catch (error) {
      console.error("Error making appointment:", error);
    }
    setFormData(INITIAL_STATE);
  };

     //loading placeholder
     if (loading) {
      return <div>Loading...</div>;
    }

  return (
    <form onSubmit={handleSubmit}>
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

export default AppointmentForm;
