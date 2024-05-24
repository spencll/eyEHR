import React, {useState} from "react";
import EHRApi from './api';
import { useNavigate } from "react-router-dom";


// Bringing down functions for changing state as props
function LoginForm({setIsLogged}) {

    const navigate = useNavigate();
  // Used for clearing form 
  const INITIAL_STATE = { username: "", password: "" };

    // state for form input
    const [formData, setFormData] = useState(INITIAL_STATE);

    // matches input value to what was typed
    const handleChange = (event) => {
      const { name, value } = event.target;
      setFormData({ ...formData, [name]: value})
    };

    // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
    const handleSubmit = async (event) => {
        event.preventDefault();
          try {
              const token = await EHRApi.login(formData.username, formData.password);
              setIsLogged(token); 
              navigate("..", { relative: "path" })
  
            } catch (error) {
              console.error('Error logging in:', error);
            }
        setFormData(INITIAL_STATE)
      };
  
    return (
      <form onSubmit={handleSubmit} >
        <h1>Login!</h1>

        <label htmlFor="username" >Username</label>
        <input
        id="username"
        name="username"
        placeholder="username"
        value={formData.username}
        onChange={handleChange}
      />

        <label htmlFor="password" >Password</label>
        <input
        id="password"
        name="password"
        placeholder="password"
        value={formData.password}
        onChange={handleChange}
      />

        <button type="submit">Login!</button>
      </form>
    );
  }
  
// end

export default LoginForm
