import React, {useState, useEffect} from "react";
import { useNavigate, useParams} from "react-router-dom";
import EHRApi from "./api";

// Bringing down functions for changing state as props
function EncounterForm({userInfo}) {

  const navigate = useNavigate();
  const [isEditable, setEditable] = useState(false)

      // Parem extraction
      const {eid, pid} = useParams()

    //   Can add more categories into result
   const INITIAL_STATE= {  
    mood: "",
 vision: ""}

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
          try {
            const encounter = await EHRApi.getPatientEncounter(pid, eid)
            setEncounter(encounter)

            // If results not populated yet, use initial state as results 
            const initialResults = encounter.results ? encounter.results : INITIAL_STATE;
            setFormData(initialResults)
            setLoading(false)

            // Updates editable state if is correct user id and not signed
            if (encounter.uid === userInfo.id && !encounter.signed) setEditable(true)


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
      <form onSubmit={handleSubmit} >

        <h1>Exam results</h1>

        <label htmlFor="mood" >Mood</label>
        <input
        type="text"
        id="mood"
        name="mood"
        value={formData.mood}
        onChange={handleChange}
        disabled={!isEditable}
      />

        <label htmlFor="vision" >Vision</label>
        <input
        type="text"
        id="vision"
        name="vision"
        value={formData.vision}
        onChange={handleChange}
        disabled={!isEditable}
      />

    {isEditable ? (
        <button type="submit">Sign chart!</button>
      ) : (
        <button type="button" onClick={handleUnsign}>Unsign</button>
      )}    
      {/* Signed area*/}

      {encounter.signed? (
             <div>
             <p>Signed by: {encounter.signedBy}  </p>
             <p>Signed at: {encounter.signedAt}  </p>
     
           </div>

      ): null}
 
   


      </form>
    );
  }
  
// end

export default EncounterForm
