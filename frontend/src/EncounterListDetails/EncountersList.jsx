import "../PatientProfile.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import EHRApi from "../api";

function EncountersList({
  encounters,
  formatDateTime,
  setRefresh,
  refresh,
  userInfo,
}) {
  const navigate = useNavigate();

  useEffect(() => {}, [refresh]);

  const handleDelete = async (pid, id) => {
    try {
      await EHRApi.deleteEncounter(pid, id);
      setRefresh(!refresh);
    } catch (error) {
      console.error("Error deleting encounter:", error);
    }
  };

  return (
    <>
      {userInfo.isHCP ? (
        <h1>Today's encounters</h1>
      ) : (
        <>
          <h1>Your exam reports</h1>
          <h3>(click on to see details)</h3>
        </>
      )}
      <div className="patient-encounters">
        {encounters && encounters.length > 0 ? (
          <ul>
            {encounters.map((encounter) => {
              const { date, time } = formatDateTime(encounter.datetime);
              return (
                <li key={encounter.id} className="encounter-card">
                  <NavLink
                    to={`/patients/${encounter.pid}/encounters/${encounter.id}/`}
                  >
                    <div>
                      <p>
                        <strong>Date: </strong>
                        {date}
                      </p>
                      <p>
                        <strong>Created at: </strong> {time}
                      </p>
                      <p>
                        <strong>Patient: </strong> {encounter.patientLastName},{" "}
                        {encounter.patientFirstName}
                      </p>
                      <p>
                        <strong>Doctor: </strong> {encounter.drLastName},{" "}
                        {encounter.drFirstName}
                      </p>
                    </div>
                  </NavLink>

                  {userInfo.isHCP ? (
                    <div className="actions">
                      <button
                        onClick={() =>
                          navigate(
                            `/patients/${encounter.pid}/encounters/${encounter.id}/edit`
                          )
                        }
                      >
                        Edit
                      </button>
                      <button
                        className="delete"
                        onClick={() =>
                          handleDelete(encounter.pid, encounter.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>{userInfo.isHCP ? "No encounters today" : "No reports found"}</p>
        )}
      </div>
    </>
  );
}

export default EncountersList;
