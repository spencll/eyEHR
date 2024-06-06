import EHRApi from "./api";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./PatientProfile.css"

function EncounterDetails() {
  const { eid, pid } = useParams();
  const [encounter, setEncounter] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEncounter = async () => {
      try {
        const encounter = await EHRApi.getPatientEncounter(pid, eid);
        setEncounter(encounter);
        setLoading(false);
      } catch (err) {
        console.error("Encounter not found:", err);
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
    
    <div className="patient-encounters">
    <li key={encounter.id} className="encounter-card">
      <div>
        <p>
          <strong>Patient: </strong>{encounter.patientLastName}, {encounter.patientFirstName}
        </p>
        <p>
          <strong>Doctor:</strong> {encounter.drLastName}, {encounter.drFirstName}
        </p>
        
        <ul>
        <li>
        <strong>Reason for visit:</strong> {encounter.results.reason || "None"}
      </li>
      <li>
        <strong>Eye pressure: </strong> 
        <br/>
        OD: {encounter.results.rpressure}
        <br/>
        OS: {encounter.results.lpressure}
      </li>
      <li>
        <strong>Vision: </strong> 
        <br/>
        OD: 20/{encounter.results.rvision}
        <br/>
        OS: 20/{encounter.results.lvision}
      </li>
      <li>
        <strong>Assessment and plan: </strong> {encounter.results.ap|| "None"}
      </li>
        </ul>
      </div>
    </li>
    </div>
  );
}

export default EncounterDetails;
