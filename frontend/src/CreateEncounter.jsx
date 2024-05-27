import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import EHRApi from './api'; 

const CreateEncounter = ({ userInfo }) => {
  const { pid } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const createEncounter = async () => {
      try {
        const newEncounter = await EHRApi.makeEncounter(pid, {userId: userInfo.id, patientId: pid});
        navigate(`/patients/${pid}/encounters/${newEncounter.id}/edit`);
      } catch (err) {
        console.error('Failed to create encounter:', err);
        // Handle error appropriately
      }
    };

    createEncounter();
  }, []);

  return <div>Creating Encounter...</div>; // Optionally show a loading state
};

export default CreateEncounter;
