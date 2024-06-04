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
        // Handle error appropriately
      }
    }
    };

    loadEncounter();
  }, []);
  // Helps handle page refreshes 
  // const username= JSON.parse(localStorage.getItem("user"))["username"]

  return (<>
    {isLogged ? (<> <h1>Welcome back {userInfo.username}!  </h1>
    <div className="encounters-list">
      <h3>Unsigned encounters</h3>
      {userInfo.isHCP && notSignedEncounters && notSignedEncounters.length > 0 ? (
          <ul>
           {notSignedEncounters.map((encounter) => {
              const { date, time } = formatDateTime(encounter.datetime);
              return (
                <li key={encounter.id} className="encounter-card">
                   <NavLink to={`/patients/${encounter.patient_id}/encounters/${encounter.id}/edit`}>
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
          <p>You are caught up! </p>
        )}
      </div>
  
  </>

  ): <h1>Welcome to EyeHR!</h1>}

 
    </>
    
)
}

export default Home;
