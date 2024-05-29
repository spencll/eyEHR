import EHRApi from './api';
import { useParams,NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import "./PatientProfile.css"

function PatientProfile({userInfo}) {

    // Parem extraction
    const {pid} = useParams()
    // patient state 
    const [patient, setPatient] = useState({});


    //Extracting date and time from datetime 
const formatDateTime = (datetime) => {
  const dateObj = new Date(datetime);
  const date = dateObj.toLocaleDateString(); // Extract date
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Extract time
  return { date, time };
};
const fetchPatientDetails = async () => {
  try {
    const patientData = await EHRApi.getPatient(pid);
    setPatient(patientData);
    console.log(patientData)
  } catch (error) {
    console.error('Error fetching patient details:', error);
  }
};

  useEffect(() => {
    fetchPatientDetails();  
  }, [pid]);

 
  const handleDelete = async (eid) =>{
    await EHRApi.deleteEncounter(pid, eid)
    setPatient((prevPatient) => ({
      ...prevPatient,
      encounters: prevPatient.encounters.filter((encounter) => encounter.id !== eid),
    }));
  }

    return (
          <div className="patient-card">
            <h2 className="patient-name">{patient.firstName} {patient.lastName}</h2>
            <div className="patient-details">
            <div className="patient-appointments">
        <h3>Appointments</h3>

        {patient.appointments && patient.appointments.length > 0 ? (
          <ul>
           {patient.appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetime);
              return (
                <div key={appointment.id}>
                  <p>Date: {date}</p>
                  <p>Time: {time}</p>
                  <p>Doctor: {appointment.drLastName}, {appointment.drFirstName}</p>
                </div>
              );
            })}
          </ul>
        ) : (
          <p>No appointments found</p>
        )}
      </div>
      <NavLink to={`/patients/${pid}/appointments/new`}>Make appointment </NavLink>

      <div className="patient-encounters">
      <h3>Encounters</h3>
      {patient.encounters && patient.encounters.length > 0 ? (
        <ul>
          {patient.encounters.map((encounter) => {
            const { date, time } = formatDateTime(encounter.datetime);
            return (
              <li key={encounter.id} className="encounter-card">
                <NavLink to={`/patients/${pid}/encounters/${encounter.id}/edit`}>
                  <div>
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p><strong>Doctor:</strong> {encounter.drLastName}, {encounter.drFirstName}</p>
                  </div>
                </NavLink>
                <button onClick={() => handleDelete(encounter.id)}>Delete</button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No encounters found</p>
      )}
      </div>
      {userInfo.isHCP?  <>
        <NavLink to={`/patients/${pid}/encounters/new`}>Make encounter </NavLink>
          </> : null}
            </div>
          </div>
          
        )
  }

  export default PatientProfile