import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import EHRApi from "./api";
import "./EncounterForm.css"

// Bringing down functions for changing state as props
function EncounterForm({userInfo}) {

    // Pulling from local storage
    const isHCP= JSON.parse(localStorage.getItem("user"))["isHCP"] 

    // Editable state initialized by local storage
    const [isEditable, setEditable] = useState(() => {
        const savedEditable = localStorage.getItem('isEditable');
        return savedEditable !== null ? JSON.parse(savedEditable) : false;
      });

      // Parem extraction
      const {eid, pid} = useParams()

      let navigate = useNavigate()

    //   Can add more categories into result
   const INITIAL_STATE= {
    reason: "",  
    mood: "",
 vision: "",
ap:""}

    //  Formdata is object be nested in results 
     const [formData, setFormData] = useState(INITIAL_STATE);
    // Encounter state for checking signed status
     const [encounter,setEncounter] =useState({})
    // loading placeholder
     const [loading, setLoading] = useState(true);

    //  Getting encounter upon arriving to encouter form. 
    // Populate form with existing data

     useEffect(() => {
        const loadEncounter = async () => {
            // Redirect to 
            if (!isHCP) navigate(`/patients/${pid}/encounters/${eid}`)

          try {
            const encounter = await EHRApi.getPatientEncounter(pid, eid)
            setEncounter(encounter)

            // If results not populated yet, use initial state as results 
            const initialResults = encounter.results ? encounter.results : INITIAL_STATE;
            setFormData(initialResults)
            setLoading(false)

            // Updates editable state if is correct user id and not signed
            if (encounter.uid === userInfo.id && !encounter.signed) {
                setEditable(true)
                localStorage.setItem('isEditable', true);
            }


          } catch (err) {
            console.error('Encounter not found:', err);
            // Handle error appropriately
          }
        };
    
        loadEncounter();
      }, []);


    // matches input value to what was typed 
    const handleChange = async (event) => {
        if (isEditable){
      const { name, value } = event.target;
    //   carrying over formdata and updating values to form values
      let newFormData= { ...formData, [name]: value}
       await EHRApi.updateEncounter(pid, eid, {...newFormData})
    //   Update formData state
      setFormData(newFormData)
      setEncounter(encounter)
    }
    };

    // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
            const encounter= await EHRApi.signEncounter(pid, eid, {signedBy: `${userInfo.lastName}, ${userInfo.firstName}`});
            setEditable(false)
            localStorage.setItem('isEditable', false);
            setEncounter(encounter)

          } catch (error) {
            console.error('Error signing:', error);
          }
    };

    const handleUnsign = async (event) => {
        event.preventDefault();
          try {
              const encounter = await EHRApi.unsignEncounter(pid, eid);
              setEditable(true)  
              setEncounter(encounter)
            } catch (error) {
              console.error('Error signing:', error);
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
            value={formData.reason}
            onChange={handleChange}
            disabled={!isEditable}
            rows={4}
            cols={50}
          ></textarea>
        </div>
      
        <div className="form-group">
          <label htmlFor="mood">Mood</label>
          <input
            type="text"
            id="mood"
            name="mood"
            value={formData.mood}
            onChange={handleChange}
            disabled={!isEditable}
          />
        </div>
      
        <div className="form-group vision-group">
    <label htmlFor="vision">Vision: 20/</label>
    <select
      id="vision"
      name="vision"
      value={formData.vision}
      onChange={handleChange}
      disabled={!isEditable}
    >
      <option key={20} value={20}>20</option>
      <option key={25} value={25}>25</option>
      <option key={30} value={30}>30</option>
      <option key={40} value={40}>40</option>
      <option key={50} value={50}>50</option>
      <option key={100} value={100}>100</option>
      <option key={200} value={200}>200</option>
    </select>
  </div>
      
        <div className="form-group">
          <label htmlFor="ap">Assessment and plan</label>
          <textarea
            id="ap"
            name="ap"
            value={formData.ap}
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
      <button type="button" onClick={handleUnsign}>Unsign</button>
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

export default EncounterForm
