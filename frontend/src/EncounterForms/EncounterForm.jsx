import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EHRApi from "../api";
import "./EncounterForm.css";

// Bringing down functions for changing state as props
function EncounterForm({ userInfo }) {
  const [isEditable, setEditable] = useState(false);

  // Parem extraction
  const { eid, pid } = useParams();

  let navigate = useNavigate();

  //   Can add more categories into result
  const INITIAL_STATE = {
    reason: "",
    rvision: 20,
    lvision: 20,
    findings: "",
    ap: "",
    rpressure: 0,
    lpressure: 0,
  };

  //  Formdata is object be nested in results
  const [formData, setFormData] = useState(INITIAL_STATE);
  // Encounter state for checking signed status
  const [encounter, setEncounter] = useState({});
  // loading placeholder
  const [loading, setLoading] = useState(true);

  //  Getting encounter upon arriving to encouter form.
  // Populate form with existing data

  useEffect(() => {
    const loadEncounter = async () => {
      // Redirect to encounter details if not HCP
      if (!userInfo.isHCP) navigate(`/patients/${pid}/encounters/${eid}`);

      try {
        const encounter = await EHRApi.getPatientEncounter(pid, eid);
        setEncounter(encounter);

        // If results not populated yet, use initial state as results.
        const initialResults = encounter.results
          ? encounter.results
          : INITIAL_STATE;
        setFormData(initialResults);
        setLoading(false);
        // Also initialize encounter data
        if (!encounter.results)
          await EHRApi.updateEncounter(pid, eid, { formData });

        // Updates editable state if is correct user id and not signed
        if (encounter.uid === userInfo.id && !encounter.signed) {
          setEditable(true);
        } else {
          setEditable(false);
        }
      } catch (err) {
        console.error("Encounter not found:", err);
        // Handle error appropriately
      }
    };

    loadEncounter();
  }, [pid, eid, navigate, userInfo.id]);

  // matches input value to what was typed
  const handleChange = async (event) => {
    if (isEditable) {
      const { name, value } = event.target;
      //   carrying over formdata and updating values to form values
      let newFormData = { ...formData, [name]: value };
      await EHRApi.updateEncounter(pid, eid, { ...newFormData });
      //   Update formData state
      setFormData(newFormData);
      setEncounter(encounter);
    }
  };

  // Signs encounter
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const encounter = await EHRApi.signEncounter(pid, eid, {
        signedBy: `${userInfo.lastName}, ${userInfo.firstName}`,
      });
      setEditable(false);
      setEncounter(encounter);
    } catch (error) {
      console.error("Error signing:", error);
    }
  };

  const handleUnsign = async (event) => {
    event.preventDefault();
    try {
      const encounter = await EHRApi.unsignEncounter(pid, eid);
      setEditable(true);
      setEncounter(encounter);
    } catch (error) {
      console.error("Error signing:", error);
    }
  };

  //loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <form className="encounter-form" onSubmit={handleSubmit}>
      <h1>Exam results</h1>

      <div className="form-group">
        <label htmlFor="reason">Reason for visit</label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason || ""}
          onChange={handleChange}
          disabled={!isEditable}
          rows={4}
          cols={50}
        ></textarea>
      </div>

      <div className="form-group pressure-group">
        <label>Eye pressure</label>
        <label htmlFor="rpressure">OD: </label>
        <input
          type="number"
          id="rpressure"
          name="rpressure"
          value={formData.rpressure}
          onChange={handleChange}
          disabled={!isEditable}
        />
        <label htmlFor="lpressure">OS: </label>
        <input
          type="number"
          id="lpressure"
          name="lpressure"
          value={formData.lpressure}
          onChange={handleChange}
          disabled={!isEditable}
        />
      </div>

      <div className="form-group">
        <label>Vision</label>

        <div className="vision-group">
          <label htmlFor="rvision">OD: 20/</label>
          <select
            id="rvision"
            name="rvision"
            value={formData.rvision || 20}
            onChange={handleChange}
            disabled={!isEditable}
          >
            <option key={20} value={20}>
              20
            </option>
            <option key={25} value={25}>
              25
            </option>
            <option key={30} value={30}>
              30
            </option>
            <option key={40} value={40}>
              40
            </option>
            <option key={50} value={50}>
              50
            </option>
            <option key={100} value={100}>
              100
            </option>
            <option key={200} value={200}>
              200
            </option>
          </select>
          <br />
          <label htmlFor="lvision">OS: 20/</label>
          <select
            id="lvision"
            name="lvision"
            value={formData.lvision || 20}
            onChange={handleChange}
            disabled={!isEditable}
          >
            <option key={20} value={20}>
              20
            </option>
            <option key={25} value={25}>
              25
            </option>
            <option key={30} value={30}>
              30
            </option>
            <option key={40} value={40}>
              40
            </option>
            <option key={50} value={50}>
              50
            </option>
            <option key={100} value={100}>
              100
            </option>
            <option key={200} value={200}>
              200
            </option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="findings">Findings</label>
        <textarea
          id="findings"
          name="findings"
          value={formData.findings || ""}
          onChange={handleChange}
          disabled={!isEditable}
          rows={4}
          cols={50}
        ></textarea>
      </div>

      <div className="form-group">
        <label htmlFor="ap">Assessment and plan</label>
        <textarea
          id="ap"
          name="ap"
          value={formData.ap || ""}
          onChange={handleChange}
          disabled={!isEditable}
          rows={4}
          cols={50}
        ></textarea>
      </div>

      <div className="form-actions">
        {isEditable ? (
          <button type="submit">Sign chart!</button>
        ) : (
          <button type="button" onClick={handleUnsign}>
            Unsign
          </button>
        )}
        {encounter.signed && (
          <div className="signature">
            <p>Signed by: {encounter.signedBy}</p>
            <p>Signed at: {encounter.signedAt}</p>
          </div>
        )}
      </div>
    </form>
  );
}

// end

export default EncounterForm;
