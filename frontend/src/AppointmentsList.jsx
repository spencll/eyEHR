import { useEffect } from "react";
import "./AppointmentsList.css";
import { NavLink,useParams } from 'react-router-dom';

function AppointmentsList({appointments, formatDateTime}) {
     // Parem extraction
     const {pid} = useParams()

    return (<>
      <div className="appointments-list">
      {appointments && appointments.length > 0 ? (
          <ul>
           {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetime);
              return (
                <div key={appointment.id}>
                  <p>Date: {date}</p>
                  <p>Time: {time}</p>
                  <p>Patient: {appointment.patientLastName}, {appointment.patientFirstName}</p>
                  <p>Doctor: {appointment.drLastName}, {appointment.drFirstName}</p>
                  <NavLink to={`/patients/${pid}/encounters/new`}>Make encounter </NavLink>
                </div>
                
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