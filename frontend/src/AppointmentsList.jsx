import "./AppointmentsList.css";
import { Link } from 'react-router-dom';


function AppointmentsList({appointments, formatDateTime}) {

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
                  <p>Doctor: {appointment.drLastName}, {appointment.drFirstName}</p>
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