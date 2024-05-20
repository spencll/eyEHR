import React from "react";
import { NavLink } from "react-router-dom";
import { Navbar, Nav, NavItem } from "reactstrap";
import { useState, useEffect } from 'react';
import "./NavBar.css"
import EHRApi from './api';

function NavBar({isLogged, logout, userInfo}) {

  // Search bar stuff
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

  const handleSearchChange = async (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    if (query.length > 2) { // Fetch results only if query length is greater than 2
      const response = await EHRApi.queryPatients(searchQuery)
      setSearchResults(response);
    } else {
      setSearchResults([]);
    }
  };

  // Debounce search query
  useEffect(() => {

    // Basically, delays the query until results done
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 100); // Adjust the delay as needed

    // Cleanup function to cancel the timeout if query changes before the delay completes
    return () => {
      clearTimeout(handler);
    };

  }, [searchQuery]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.length > 2) {
        const response = await EHRApi.queryPatients(debouncedQuery);
        setSearchResults(response);
      } else {
        setSearchResults([]);
      }
    };

    fetchResults();
  }, [debouncedQuery]);




  return (
<div>
      <Navbar expand="md" >
        <NavLink to="/" className="navbar-brand">
          Home
        </NavLink>

        <Nav className="ml-auto" navbar>
          {isLogged ? <>
          
          <NavItem>
            {/* Show today's appointments if HCP, user's appointments if regular user  */}
            <NavLink to="/companies">Your apppointments</NavLink>
          </NavItem>

            {/* Show today's encounters if HCP, user's encounters if regular user */}
          <NavItem>
            <NavLink to="/jobs">Your encounters</NavLink>
          </NavItem>

          <NavItem>
            <NavLink to="/profile" >Profile </NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/" onClick={logout}>Log out</NavLink>
          </NavItem>
          </> :<>    <NavItem>
            <NavLink to="/signup">Sign up</NavLink>
          </NavItem>
          <NavItem>
            <NavLink to="/login">Login</NavLink>
          </NavItem></> }

           {/*Search bar if HCP  */}
          {isLogged && userInfo.isHCP?  <>
          
            <NavItem>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="search-input"
            />

            {searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map((patient) => (
                  <div key={patient.id} className="search-result-item">
                    {patient.firstName} {patient.lastName}
                  </div>
                ))}
              </div>
            )}
          </NavItem></> : null}
         
      
        </Nav>
      </Navbar>
      <hr></hr>
      </div>
  );
}

export default NavBar;
