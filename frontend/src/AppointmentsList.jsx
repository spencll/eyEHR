import "./PatientProfile.css"
import { NavLink} from 'react-router-dom';

function AppointmentsList({userInfo, appointments, formatDateTime}) {

    return (<>
    <h1>Today's appointments</h1>
      <div className="patient-appointments">
      {appointments && appointments.length > 0 ? (
          <ul>
           {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetime);
              return (
                <li key={appointment.id} className="appointment-card">
             
                  <div >
                    <p><strong>Appointment Date:</strong> {date}</p>
                    <p><strong>Appointment Time:</strong> {time}</p>
                    <p><strong>Patient:</strong> {appointment.patientLastName}, {appointment.patientFirstName}</p>
                    <p><strong>Doctor:</strong> {appointment.drLastName}, {appointment.drFirstName}</p>
                  </div>
              
                
                {userInfo.isHCP? (<NavLink to={`/patients/${appointment.pid}/encounters/new`}><button>Make encounter</button> </NavLink>):null}
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