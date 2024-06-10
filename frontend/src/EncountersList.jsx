import "./PatientProfile.css"
import {NavLink, useNavigate, useParams} from 'react-router-dom';
import { useEffect } from "react";
import EHRApi from './api';

function EncountersList({encounters, formatDateTime,setRefresh,refresh}) {

  const navigate = useNavigate();

   // Parem extraction
   const {pid} = useParams()

   useEffect(() => {
  }, [refresh]);

  const handleDelete = async (id) =>{
    try {
      await EHRApi.deleteEncounter(pid, id);
      setRefresh(!refresh);
    } catch (error) {
      console.error('Error deleting encounter:', error);
      // Handle the error, e.g., display an error message to the user
    }
  }

    return (<>
      <div className="patient-encounters">
      {encounters && encounters.length > 0 ? (
          <ul>
           {encounters.map((encounter) => {
              const { date, time } = formatDateTime(encounter.datetime);
              return (
                <li key={encounter.id} className="encounter-card">
                   <NavLink to={`/patients/${encounter.pid}/encounters/${encounter.id}/`}>

                    <div>
                  <p><strong>Date: </strong>{date}</p>
                  <p><strong>Time: </strong> {time}</p>
                  <p><strong>Patient: </strong> {encounter.patientLastName}, {encounter.patientFirstName}</p>
                  <p><strong>Doctor: </strong> {encounter.drLastName}, {encounter.drFirstName}</p>
                  
                  </div>
                  </NavLink>
                  <div className="actions">
                <button onClick={() => navigate(`/patients/${pid}/encounters/${encounter.id}/edit`)}>Edit</button>
                <button onClick={() => handleDelete(encounter.id)}>Delete</button>
                </div>
                </li>
    
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