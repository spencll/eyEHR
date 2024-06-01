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

    //  Getting encounter upon arriving to encouter form. 
    // Populate form with existing data

     useEffect(() => {
        const loadEncounter = async () => {
          try {
            const encounter = await EHRApi.getPatientEncounter(pid, eid)
            console.log(encounter)

            // If results not populated yet, use initial state as results 
            const initialResults = encounter.results ? encounter.results : INITIAL_STATE;
            setFormData(initialResults)

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
    }
    };

    // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
            await EHRApi.signEncounter(pid, eid, {signedBy: `${userInfo.lastName}, ${userInfo.firstName}`});
    
            navigate("..", { relative: "path" })

          } catch (error) {
            console.error('Error signing:', error);
          }
      setFormData({})
    };

    const handleUnsign = async (event) => {
        event.preventDefault();
          try {
              await EHRApi.unsignEncounter(pid, eid);
      
              navigate("..", { relative: "path" })
  
            } catch (error) {
              console.error('Error signing:', error);
            }
        setFormData({})
      };
  
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
   


      </form>
    );
  }
  
// end

export default EncounterForm
