import "./PatientProfile.css"
import { NavLink} from 'react-router-dom';

function AppointmentsList({userInfo, appointments, formatDateTime}) {

    return (<>
      <div className="patient-appointments">
      {appointments && appointments.length > 0 ? (
          <ul>
           {appointments.map((appointment) => {
              const { date, time } = formatDateTime(appointment.datetime);
              return (
                <li key={appointment.id} className="appointment-card">
             
                  <div >
                    <p><strong>Date:</strong> {date}</p>
                    <p><strong>Time:</strong> {time}</p>
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