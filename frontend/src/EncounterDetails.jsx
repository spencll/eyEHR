import EHRApi from "./api"
import { useState,useEffect } from "react";
import { useParams} from "react-router-dom";

function EncounterDetails(){

    const {eid, pid} = useParams()
    const [encounter, setEncounter] = useState({})
    const [loading, setLoading] = useState(true);


useEffect(() => {
    const loadEncounter = async () => {
      try {
        const encounter = await EHRApi.getPatientEncounter(pid, eid)
        setEncounter(encounter)
        setLoading(false);

      } catch (err) {
        console.error('Encounter not found:', err);
        // Handle error appropriately
      }
    };
    loadEncounter();
  }, []);

//loading state 
  if (loading) {
    return <div>Loading...</div>;
  }
  

return (
<li key={encounter.id} className="encounter-card">
                    <div> 
                  <p>Patient: {encounter.patientLastName}, {encounter.patientFirstName}</p>
                  <p>Doctor: {encounter.drLastName}, {encounter.drFirstName}
                  </p>
                  <ul>
          {Object.entries(encounter.results).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
                  </div>
                </li>



)

}

export default EncounterDetails