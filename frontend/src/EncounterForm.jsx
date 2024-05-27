import React, {useState, useEffect} from "react";
import { useNavigate, useParams} from "react-router-dom";
import EHRApi from "./api";

// Bringing down functions for changing state as props
function EncounterForm() {

  const navigate = useNavigate();

      // Parem extraction
      const {eid, pid} = useParams()

     const INITIAL_STATE =  {results:""};
     const [formData, setFormData] = useState(INITIAL_STATE);

    //  Getting encounter upon arriving to encouter form. 
    // Populate form with existing data

     useEffect(() => {
        const loadEncounter = async () => {
          try {
            const encounter = await EHRApi.getPatientEncounter(pid, eid)  
            const initialResults = encounter.results ? encounter.results.results : "";
            setFormData({ results: initialResults})
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
      setFormData({ ...formData, [name]: value})
      await EHRApi.updateEncounter(pid, eid, formData)
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
      setFormData(INITIAL_STATE)
    };
  
    return (
      <form onSubmit={handleSubmit} >
        <h1>Exam results</h1>

        <label htmlFor="results" >Results</label>
        <input
        type="text"
        id="results"
        name="results"
        value={formData.results}
        onChange={handleChange}
      />

        <button type="submit">Sign up!</button>
      </form>
    );
  }
  
// end

export default EncounterForm
