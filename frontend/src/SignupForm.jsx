import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import EHRApi from "./api";

// Bringing down functions for changing state as props
function SignUpForm({setIsLogged}) {

  const navigate = useNavigate();

  // Used for clearing form 
  const INITIAL_STATE = { username: "", password: "", firstName: "", lastName: "",email: "",invitationCode:"" };

    // state for form input
    const [formData, setFormData] = useState(INITIAL_STATE);

      // State for error messages
  const [errors, setError] = useState([]);

  const [showPassword, setShowPassword] = useState(false);

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
            setIsLogged(token); 
            localStorage.setItem('token', token)
            navigate("..", { relative: "path" })

          } catch (error) {
            console.error('Error registering:', error);
            setError([...error])
          }
      setFormData(INITIAL_STATE)
    };

    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <form onSubmit={handleSubmit} className="form-container" >
        <h1>Sign up!</h1>
        {errors && errors.map((error, index) => (
            <div className="alert" key={index}>{error}</div>

          ))} {/* Display error message */}

        <label htmlFor="username" >Username</label>
        <input
        id="username"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />

        <label htmlFor="password" >Password</label>
        <input type={showPassword ? "text" : "password"}
        id="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
      />

      <div>
      <label htmlFor="showPassword">Show Password</label>
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={toggleShowPassword}
        />
      </div>

<label htmlFor="firstName" >First name</label>
        <input
        id="firstName"
        name="firstName"
        placeholder="First name"
        value={formData.firstName}
        onChange={handleChange}
      />

<label htmlFor="lastName" >Last name</label>
        <input
        id="lastName"
        name="lastName"
        placeholder="Last name"
        value={formData.lastName}
        onChange={handleChange}
      />

<label htmlFor="email" >Email</label>
        <input
        id="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
      />

<label htmlFor="invitationCode" >Healthcare provider code</label>
        <input
        id="invitationCode"
        name="invitationCode"
        placeholder="Leave blank if you are a patient"
        value={formData.invitationCode}
        onChange={handleChange}
      />

        <button type="submit">Sign up!</button>
      </form>
    );
  }
  
// end

export default SignUpForm
