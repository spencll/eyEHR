import EHRApi from './api';
import { useParams,NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';


function PatientProfile({userInfo}) {

    // Parem extraction
    const {pid} = useParams()
    // patient state 
    const [patient, setPatient] = useState([]);
    const [doctor, setDoctor] = useState([]);


    //Extracting date and time from datetime 
const formatDateTime = (datetime) => {
  const dateObj = new Date(datetime);
  const date = dateObj.toLocaleDateString(); // Extract date
  const time = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); // Extract time
  return { date, time };
};

  useEffect(() => {
    const fetchPatientDetails = async () => {
      try {
        const patientData = await EHRApi.getPatient(pid);

        setPatient(patientData);

      } catch (error) {
        console.error('Error fetching patient details:', error);
      }
    };

    fetchPatientDetails();
  }, [pid]);

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
                <div key={encounter.id}>
                  <p>Date: {date}</p>
                  <p>Time: {time}</p>
                  <p>Doctor: {encounter.drLastName}, {encounter.drFirstName}</p>
                </div>
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