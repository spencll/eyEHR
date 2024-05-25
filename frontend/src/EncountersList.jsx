
import { Link } from 'react-router-dom';


function EncountersList({encounters}) {

    return (<>
      <div className="encounters-list">
      {encounters && encounters.length > 0 ? (
          <ul>
           {encounters.map((appointment) => {
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
          <p>No encounters today</p>
        )}
      </div>
      </>
    );
  }

  
  
  export default EncountersList