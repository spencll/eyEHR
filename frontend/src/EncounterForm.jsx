import React, {useState, useEffect} from "react";
import { useNavigate, useParams} from "react-router-dom";
import EHRApi from "./api";

// Bringing down functions for changing state as props
function EncounterForm() {

  const navigate = useNavigate();

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
            // If results not populated yet, use initial state as results 
            const initialResults = encounter.results ? encounter.results : INITIAL_STATE;
            setFormData(initialResults)
          } catch (err) {
            console.error('Encounter not found:', err);
            // Handle error appropriately
          }
        };
    
        loadEncounter();
      }, []);


    // matches input value to what was typed 
    const handleChange = async (event) => {
      const { name, value } = event.target;
    //   carrying over formdata and updating values to form values
      let newFormData= { ...formData, [name]: value}
      await EHRApi.updateEncounter(pid, eid, {...newFormData})
    //   Update formData state
      setFormData(newFormData)
    };

    // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
            await EHRApi.updateEncounter(formData);
    
            navigate("..", { relative: "path" })

          } catch (error) {
            console.error('Error registering:', error);
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
      />

        <label htmlFor="vision" >Vision</label>
        <input
        type="text"
        id="vision"
        name="vision"
        value={formData.vision}
        onChange={handleChange}
      />

        <button type="submit">Sign chart!</button>
      </form>
    );
  }
  
// end

export default EncounterForm
