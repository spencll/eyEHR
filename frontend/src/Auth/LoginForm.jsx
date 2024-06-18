import React, { useState, useEffect } from "react";
import EHRApi from "../api";
import { useNavigate } from "react-router-dom";

// Bringing down functions for changing state as props
function LoginForm({ setIsLogged }) {
  const navigate = useNavigate();
  // Used for clearing form
  const INITIAL_STATE = { username: "", password: "" };

  // state for form input
  const [formData, setFormData] = useState(INITIAL_STATE);

  // State for error messages to display
  const [error, setError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // matches input value to what was typed
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  // Prevents empty submission/category. Adds item to appropriate state array. Clears input and redirect to changed menu.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      const token = await EHRApi.login(formData.username, formData.password);
      setIsLogged(token);
      navigate("..", { relative: "path" });
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error);
    }

    setFormData(INITIAL_STATE);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h1>Log in!</h1>
      {error && <div className="alert">{error}</div>}{" "}
      {/* Display error message */}
      <label htmlFor="username">Username</label>
      <input
        id="username"
        name="username"
        placeholder="Username"
        value={formData.username}
        onChange={handleChange}
      />
      <label htmlFor="password">Password</label>
      <input
        type={showPassword ? "text" : "password"}
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
      <button type="submit">Login!</button>
    </form>
  );
}

// end

export default LoginForm;
