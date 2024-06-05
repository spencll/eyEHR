import { useEffect } from "react";
import "./PatientProfile.css"
import { NavLink,useParams } from 'react-router-dom';

function AppointmentsList({appointments, formatDateTime}) {
     // Parem extraction
     const {pid} = useParams()

     // Pulling from local storage
    const isHCP= JSON.parse(localStorage.getItem("user"))["isHCP"] 

    return (<>
      <div className="appointments-list">
      {appointments && appointments.length > 0 ? (
          <ul>
           {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetime);
              return (
                <li key={appointment.id} className="appointment-card">
             
                  <div className="content">
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
                    <p><strong>Patient:</strong> {appointment.patientLastName}, {appointment.patientFirstName}</p>
                    <p><strong>Doctor:</strong> {appointment.drLastName}, {appointment.drFirstName}</p>
                  </div>
              
                
                {isHCP? (<NavLink to={`/patients/${pid}/encounters/new`}>Make encounter </NavLink>):null}
              </li>
                
              );
            })}
          </ul>
        ) : (
          <p>No appointments today</p>
        )}
      </div>
      </>
    );
  }

  
  
  export default AppointmentsList