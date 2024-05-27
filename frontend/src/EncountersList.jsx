
import { Link } from 'react-router-dom';


function EncountersList({encounters, formatDateTime}) {

    
    return (<>
      <div className="encounters-list">
      {encounters && encounters.length > 0 ? (
          <ul>
           {encounters.map((encounter) => {
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
          <p>No encounters today</p>
        )}
      </div>
      </>
    );
  }

  
  
  export default EncountersList