import React, {useState, useEffect} from "react";
import EHRApi from './api';
import { useNavigate, useParams} from "react-router-dom";

// Only for PCP
function PatientForm({setRefresh, refresh, userInfo}) {

     const [patient, setPatient] = useState({})

  const navigate = useNavigate();

  // Used for clearing form 
  const INITIAL_STATE = {firstName: "", lastName: "", email: ""};

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
            const patient= await EHRApi.addPatient(formData);
            setPatient(patient)
            setRefresh(!refresh)
            navigate("../..", { relative: "path" })

          } catch (error) {
            console.error('Error making appointment:', error);
          }
      setFormData(INITIAL_STATE)
    };
  
    return (
      <form onSubmit={handleSubmit} >
        <h1>Register patient !</h1>


<div className="form-group">
          <label htmlFor="firstName">First name</label>
          <input
            type="text"
            id="firstName"
            name= "firstName"
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
          <label htmlFor="email">Email </label>
          <input
            type="text"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Submit!</button>
      </form>
    );
  }
  
// end

export default PatientForm
