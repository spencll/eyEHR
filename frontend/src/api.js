import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL || "http://localhost:3001"; 

/** API Class.
 *
 * Static class tying together methods used to get/send to to the API.
 * There shouldn't be any frontend-specific stuff here, and there shouldn't
 * be any API-aware stuff elsewhere in the frontend.
 *
 */

class EHRApi {
  // the token for interactive with the API will be stored here.

  //API request function, takes endpoit, data, method. Has default of empty data and get 
  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
  
    // If GET, use data as query. If anything else, use as req.body
    const params = (method === "get")
        ? data
        : {};

    try {
      return (await axios({ url, method, data, params})).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }

  // Individual API routes


//register/login/logout

  /** Signup for site. */
  static async signup(data) {
    let res = await this.request(`auth/register`, data, "post");

    // Adding token in local storage for logged in state
    localStorage.setItem('token',res.token)
    return res.token;
  }
      
  /** Get token for login from username, password. */
  static async login(data) {

    let res = await this.request(`auth/token`, data, "post");
    // Adding token in local storage for logged in state
    localStorage.setItem('token',res.token)
    return res.token;
  }
 // Logout user
    static async logoutUser() {
      try{
      let res = await this.request('auth/logout')
      return res
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }

//   Get all users
static async getAllUsers() {
  let res = await this.request('users');
  return res.users;
}


// Patch user
  static async updateProfile(username, data) {
    let res = await this.request(`users/${username}`, data, "patch");
    return res.user;
  }

  // GETS

    // Getting user info 
    static async getUser(username) {
      try{
      let res = await this.request(`users/${username}`)
      return res.user
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }

    // Getting patient info 
    static async getPatient(pid) {
      try{
      let res = await this.request(`patients/${pid}`)
      return res.patient 
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }

    // Getting appointments for a patient 
    static async getPatientAppointments(pid) {
      try{
      let res = await this.request(`patients/${pid}/appointments`)
      return res.appointments
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }

    // Getting encounters for a patient
    static async getPatientEncounters(pid) {
      try{
      let res = await this.request(`patients/${pid}/encounters`)
      return res.encounters
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }
    // Getting today's appointments for user
    static async getTodayAppointments(username) {
      try{
      let res = await this.request(`users/${username}/appointments`)
      return res.appointments
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }



}


export default EHRApi;