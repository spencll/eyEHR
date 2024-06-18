import "./AppointmentForm.css";
import React, { useState, useEffect } from "react";
import EHRApi from "../api";
import { useNavigate, useParams } from "react-router-dom";

function EditAppointment({ setRefresh, refresh}) {

  // Parem extraction
  const { pid, aid } = useParams();
  const [patient, setPatient] = useState({});

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const patientData = await EHRApi.getPatient(pid);
        setPatient(patientData);
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
        setError("Failed to fetch patient data");
      }
    };

    fetchPatient();
  }, [pid]);

  const navigate = useNavigate();

  // Used for clearing form
  const INITIAL_STATE = { datetime: "" };

  // state for form input
  const [formData, setFormData] = useState(INITIAL_STATE);

  // continues to udpate formdata object
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Make appointment and empty formdata 
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await EHRApi.updateAppointment(pid, aid, formData);
      setRefresh(!refresh);
      navigate("../../..", { relative: "path" });
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
    setFormData(INITIAL_STATE);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Edit appointment for {patient.firstName}!</h1>

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

export default EditAppointment;
