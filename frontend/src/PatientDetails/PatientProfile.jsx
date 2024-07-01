import EHRApi from "../api";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../PatientProfile.css";

function PatientProfile({ userInfo, setRefresh, refresh }) {
  const navigate = useNavigate();

  // Parem extraction
  const { pid } = useParams();

  // patient state
  const [patient, setPatient] = useState({});

       // loading placeholder
       const [loading, setLoading] = useState(true);
      
  
  //Extracting date and time from datetime
  const formatDateTime = (datetime) => {
    const dateObj = new Date(datetime);
    const date = dateObj.toLocaleDateString(); // Extract date
    const time = dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }); // Extract time
    return { date, time };
  };
  const fetchPatientDetails = async () => {
    try {
      const patientData = await EHRApi.getPatient(pid);
      setPatient(patientData);
      setLoading(false)
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  // When page loads, fetch details
  useEffect(() => {
    fetchPatientDetails();
  }, [pid, refresh]);

  const handleDelete = async (id, type) => {
    if (type === "encounter") await EHRApi.deleteEncounter(pid, id);
    else await EHRApi.deleteAppointment(pid, id);
    setRefresh(!refresh);
  };

     //loading state
     if (loading) {
      return <div>Loading...</div>;
    }

  return (
    <>
      <div className="patient-card">
        <h2 className="patient-name">
          {patient.firstName} {patient.lastName} ({patient.age})
        </h2>
        <div className="patient-details">
          <p>
            <strong>Date of birth:</strong> {patient.dob}
          </p>
          <p>
            <strong>Email:</strong> {patient.email}
          </p>
          <p>
            <strong>Phone number: </strong> {patient.cell}
          </p>

          <div className="patient-appointments">
            <h3>Appointments</h3>

            {patient.appointments && patient.appointments.length > 0 ? (
              <ul>
                {patient.appointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.datetime);
                  return (
                    <li key={appointment.id} className="appointment-card">
                      <div>
                        <p>
                          <strong>Appointment Date:</strong> {date}
                        </p>
                        <p>
                          <strong>Appointment Time:</strong> {time}
                        </p>
                        <p>
                          <strong>Doctor:</strong> {appointment.drLastName},{" "}
                          {appointment.drFirstName}
                        </p>
                      </div>

                      <div className="actions">
                        <button
                          onClick={() =>
                            navigate(
                              `/patients/${pid}/appointments/${appointment.id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="delete"
                          onClick={() =>
                            handleDelete(appointment.id, "appointment")
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No appointments found</p>
            )}
          </div>
          {userInfo.isHCP ? (
            <>
              <NavLink to={`/patients/${pid}/appointments/new`}>
                <button>Make appointment</button>{" "}
              </NavLink>
            </>
          ) : null}

          <div className="patient-encounters">
            <h3>Encounters</h3>
            {patient.encounters && patient.encounters.length > 0 ? (
              <ul>
                {patient.encounters.map((encounter) => {
                  const { date, time } = formatDateTime(encounter.datetime);
                  return (
                    <li key={encounter.id} className="encounter-card">
                      <NavLink
                        to={`/patients/${pid}/encounters/${encounter.id}/`}
                      >
                        <div>
                          <p>
                            <strong>Date:</strong> {date}
                          </p>
                          <p>
                            <strong>Created at:</strong> {time}
                          </p>
                          <p>
                            <strong>Doctor:</strong> {encounter.drLastName},{" "}
                            {encounter.drFirstName}
                          </p>
                        </div>
                      </NavLink>
                      <div className="actions">
                        <button
                          onClick={() =>
                            navigate(
                              `/patients/${pid}/encounters/${encounter.id}/edit`
                            )
                          }
                        >
                          Edit
                        </button>
                        <button
                          className="delete"
                          onClick={() =>
                            handleDelete(encounter.id, "encounter")
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No encounters found</p>
            )}
          </div>

          {userInfo.isHCP ? (
            <>
              <NavLink to={`/patients/${pid}/encounters/new`}>
                <button>Make encounter </button>{" "}
              </NavLink>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

export default PatientProfile;
