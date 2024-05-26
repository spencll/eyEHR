import React, {useState, useEffect} from "react";
import { useNavigate, useParams} from "react-router-dom";
import EHRApi from "./api";

// Bringing down functions for changing state as props
function EncounterForm({userInfo}) {

  const navigate = useNavigate();

      // Parem extraction
      const {pid} = useParams()


  // Used for clearing form 
  const INITIAL_STATE =  { datetime: "", userId: userInfo.id, patientId: pid};

     // state for form input
     const [formData, setFormData] = useState(INITIAL_STATE);

    //  Initialize encounter 
  useEffect(() => {
    const createEncounter = async () => {

      try {
        // Making encounter directs you to editing form 
        const encounter = await EHRApi.makeEncounter(pid, formData);
        // After creating the encounter, can edit 
        
      } catch (err) {
        console.error('Failed to create encounter:', err);
        setError('Failed to create encounter. Please try again.');
      }
    };   createEncounter();
}, []);


    // matches input value to what was typed
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value})
    };

    // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
    const handleSubmit = async (event) => {
      event.preventDefault();
        try {
            const token = await EHRApi.signup(formData);
    
            navigate("..", { relative: "path" })

          } catch (error) {
            console.error('Error registering:', error);
          }
      setFormData(INITIAL_STATE)
    };
  
    return (
      <form onSubmit={handleSubmit} >
        <h1>Sign up!</h1>

        <label htmlFor="username" >Username</label>
        <input
        id="results"
        name="results"
        placeholder="results"
        value={formData.username}
        onChange={handleChange}
      />

    

        <button type="submit">Sign up!</button>
      </form>
    );
  }
  
// end

export default EncounterForm
