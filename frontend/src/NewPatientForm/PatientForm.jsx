import React, { useState, useEffect } from "react";
import EHRApi from "../api";
import { useNavigate, useParams } from "react-router-dom";

// Only for PCP
function PatientForm({ setRefresh, refresh }) {
  const [patient, setPatient] = useState({});

  const navigate = useNavigate();

  // Used for clearing form
  const INITIAL_STATE = {
    firstName: "",
    lastName: "",
    email: "",
    dob: "",
    age: 0,
    cell: "",
  };

  // state for form input
  const [formData, setFormData] = useState(INITIAL_STATE);

  // continues to udpate formdata object
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Calculate age based on date of birth
  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const todayDate = new Date();
    let age = todayDate.getFullYear() - birthDate.getFullYear();
    const monthDifference = todayDate.getMonth() - birthDate.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && todayDate.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };
  // Getting right format for date input
  const formatDateToMMDDYYYY = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year}`;
  };

  // Effect to update age when dob changes
  useEffect(() => {
    if (formData.dob) {
      const age = calculateAge(formData.dob);
      setFormData((prevFormData) => ({ ...prevFormData, age }));
    }
  }, [formData.dob]);

  // Make appointment and change appointment state
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Convert dob to right format
      formData.dob = formatDateToMMDDYYYY(formData.dob);
      const patient = await EHRApi.addPatient(formData);
      navigate(`../${patient.id}`, { relative: "path" });
    } catch (error) {
      console.error("Error making appointment:", error);
    }
    setFormData(INITIAL_STATE);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>Register patient!</h1>

      <div className="form-group">
        <label htmlFor="firstName">First name</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last name</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="text"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="dob">Date of birth</label>
        <input
          type="date"
          id="dob"
          name="dob"
          value={formData.dob}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="cell">Cell number</label>
        <input
          type="text"
          id="cell"
          name="cell"
          value={formData.cell}
          onChange={handleChange}
        />
      </div>

      <button type="submit">Submit!</button>
    </form>
  );
}

// end

export default PatientForm;
