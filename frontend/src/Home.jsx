import React from "react";
import { useState,useEffect } from "react";
import EHRApi from "./api";
import {NavLink} from 'react-router-dom';

function Home({userInfo, isLogged, formatDateTime}) {
  const [notSignedEncounters, setNotSignedEncounters] = useState([])

  useEffect(() => {
    const loadEncounter = async () => {
      if (isLogged && userInfo.isHCP) {
      try {
        const encounters = await EHRApi.getUnsignedEncounters(userInfo.username)
        setNotSignedEncounters(encounters)


      } catch (err) {
        console.error('Encounters not found:', err);
      }
    }
    };
    loadEncounter()
  }, [isLogged, userInfo]);

  return (
    <>
      {isLogged ? (
        <>
          <h1>Welcome back, {userInfo.firstName}!</h1>
          {userInfo.isHCP && (
            <div className="patient-encounters">
              {notSignedEncounters && notSignedEncounters.length > 0 ? (
                <ul>
                  <h3>Unsigned encounters</h3>
                  {notSignedEncounters.map((encounter) => {
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
                    );
                  })}
                </ul>
              ) : (
                <p>You are caught up! No unsigned encounters.</p>
              )}
            </div>
          )}
        </>
      ) : (<>
        <div className="welcome-container">
          <h1>Welcome to eyEHR!</h1>
          <p><strong>For patients:</strong> Login to access your health records or sign up to get started.</p>
          <p><strong>For healthcare providers:</strong> Login to access patient health records or sign up to get started. Must have provider code. </p>
        </div>
      </>
      )}
    </>
  );

}

export default Home;
