import "./AppointmentsList.css";
import { Link } from 'react-router-dom';


function AppointmentsList({appointments}) {

    return (<>
      <div className="appointments-list">
        {appointments.map((appointment, index) => (
             <Link to={`/appointments/${appointment.id}`} key={index} className="appointment-link">
          <div className="appointment-card" key={index}>
            <h2 className="appointment-name">{appointment.name}</h2>
            <div className="appointment-details">
              <p>{appointment.userId}</p>
              <p># of employees: {appointment.datetime}</p>
            </div>
          </div>
          </Link>
        ))}
      </div>
      </>
    );
  }

  
  
  export default AppointmentsList