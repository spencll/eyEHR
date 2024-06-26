import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import EHRApi from "../api";

function SignUpForm({ setIsLogged }) {
  const navigate = useNavigate();

  const INITIAL_STATE = {
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    invitationCode: "",
  };

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [errors, setError] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Starts the loading
    setLoading(true);
    try {
      const token = await EHRApi.signup(formData);
      setIsLogged(token);
      localStorage.setItem("token", token);

    // Ends the loading
    setLoading(false);

      navigate("..", { relative: "path" });
    } catch (error) {
      console.error("Error registering:", error);
      setError([...error]);
    }
    
             // Ends the loading
             setLoading(false);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Sign up!</h1>
      {errors &&
        errors.map((error, index) => (
          <div className="alert" key={index}>
            {error}
          </div>
        ))}
      {loading && <div className="loading-indicator">Signing up...</div>}
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
        disabled={loading}
      />
      <label htmlFor="password">Password</label>
      <input
        type={showPassword ? "text" : "password"}
        id="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        disabled={loading}
      />
      <div>
        <label htmlFor="showPassword">Show Password</label>
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={toggleShowPassword}
          disabled={loading}
        />
      </div>
      <label htmlFor="firstName">First name</label>
      <input
        id="firstName"
        name="firstName"
        placeholder="First name"
        value={formData.firstName}
        onChange={handleChange}
        disabled={loading}
      />
      <label htmlFor="lastName">Last name</label>
      <input
        id="lastName"
        name="lastName"
        placeholder="Last name"
        value={formData.lastName}
        onChange={handleChange}
        disabled={loading}
      />
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        placeholder="Use same patient email if you are a patient"
        value={formData.email}
        onChange={handleChange}
        disabled={loading}
      />
      <label htmlFor="invitationCode">Healthcare provider code</label>
      <input
        id="invitationCode"
        name="invitationCode"
        placeholder="Leave blank if you are a patient"
        value={formData.invitationCode}
        onChange={handleChange}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>Sign up!</button>
    </form>
  );
}

export default SignUpForm;
