import "./PatientProfile.css"
import {NavLink} from 'react-router-dom';


function EncountersList({encounters, formatDateTime}) {
    return (<>
      <div className="encounters-list">
      {encounters && encounters.length > 0 ? (
          <ul>
           {encounters.map((encounter) => {
              const { date, time } = formatDateTime(encounter.datetime);
              return (
                <li key={encounter.id} className="encounter-card">
                   <NavLink to={`/patients/${encounter.pid}/encounters/${encounter.id}/edit`}>
                    <div>
                  <p>Date: {date}</p>
                  <p>Time: {time}</p>
                  <p>Patient: {encounter.patientLastName}, {encounter.patientFirstName}</p>
                  <p>Doctor: {encounter.drLastName}, {encounter.drFirstName}</p>
                  </div>
                  </NavLink>
                </li>
              //    <li key={encounter.id} className="encounter-card">
              //    <NavLink to={`/patients/${pid}/encounters/${encounter.id}/edit`}>
              //      <div>
              //        <p><strong>Date:</strong> {date}</p>
              //        <p><strong>Time:</strong> {time}</p>
              //        <p><strong>Doctor:</strong> {encounter.drLastName}, {encounter.drFirstName}</p>
              //      </div>
              //    </NavLink>
              //    <button onClick={() => handleDelete(encounter.id)}>Delete</button>
              //  </li>
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