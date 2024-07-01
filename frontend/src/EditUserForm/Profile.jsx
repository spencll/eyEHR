import { jwtDecode } from "jwt-decode";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import EHRApi from "../api";

function Profile({ isLogged, refresh, setRefresh }) {
  const INITIAL_STATE = {
    username: "",
    firstName: "",
    lastName: "",
    email: "",
  };

    // State for error messages to display
    const [error, setError] = useState("");

        // loading state
        const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState(INITIAL_STATE);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { username } = jwtDecode(isLogged);
        const userInfo = await EHRApi.getUser(username);
        setFormData(userInfo);
        setLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [isLogged,error]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      let data = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      };

      await EHRApi.updateProfile(formData.username, data);
      setFormData(INITIAL_STATE);
      navigate("..", { relative: "path" });
      setRefresh(!refresh);
    } catch (error) {
      setError(error);
      console.error("Error updating profile:", error);
    }

    setFormData(INITIAL_STATE);
  };

     //loading placeholder
     if (loading) {
      return <div>Loading...</div>;
    }
  

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h1>Edit Profile</h1>
      {error && <div className="alert">{error}</div>}{" "}

      <div className="form-group">
        <label htmlFor="username" className="form-label">
          Username (read only):{" "}
        </label>
        <input
          id="username"
          name="username"
          placeholder="Username"
          value={formData.username}
          readOnly
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="firstName" className="form-label">
          First Name:
        </label>
        <input
          id="firstName"
          name="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName" className="form-label">
          Last Name:
        </label>
        <input
          id="lastName"
          name="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email:
        </label>
        <input
          id="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <button type="submit" className="form-button">
        Save Changes
      </button>
    </form>
  );
}

export default Profile;
