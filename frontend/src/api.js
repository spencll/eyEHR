import axios from "axios";

// Backend URL 
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
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
  
    // If GET, use data as query. If anything else, use as req.body
    const params = (method === "get")
        ? data
        : {};


    try {
      return (await axios({ url, method, data, params, headers})).data;
    } catch (err) {
      console.error("API Error:", err.response);
      let message = err.response.data.error.message;
      throw Array.isArray(message) ? message : [message];
    }
  }


//register/login/logout

  /** Signup for site. */
  static async signup(data) {
    let res = await this.request(`auth/register`, data, "post");
    localStorage.setItem('token', res.token);
    return res.token;
  }
      
  /** Get token for login from username, password. Then set localstorage with token */
  static async login(username, password) {
    try {
      const response = await axios.post(`${BASE_URL}/auth/token`, {
        username,
        password
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      return response.data.token;

    } catch (err) {
      console.error("Login API Error:", err.response);
      let message = err.response?.data?.error?.message || err.message;
      throw Array.isArray(message) ? message : [message];
    }
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

// Query patients 
static async queryPatients(q){
  let res = await this.request(`patients?query=${q}`)
  return res.patients
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

    // Add patient
    static async addPatient(data) {
      try{
      let res = await this.request(`patients`,data, "post")
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

       // Getting user appointments 
       static async getAppointments(username) {
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

    // Make appointment 
    static async makeAppointment(pid,data) {
  
      try{
      let res = await this.request(`patients/${pid}/appointments/add`,data, "post")
      return res.appointment
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }
        // Edit appointment 
        static async updateAppointment(pid,aid,data) {
          try{
          let res = await this.request(`patients/${pid}/appointments/${aid}/edit`,data, "patch")
          return res.appointment
          }
          catch(err) {
              console.error("API Error:", err.response);
              let message = err.response.data.error.message;
              throw Array.isArray(message) ? message : [message];
          }
        }

      // Delete appointment 
      static async deleteAppointment(pid, aid) {
        try{
        let res = await this.request(`patients/${pid}/appointments/${aid}`,  {}, "delete")
        return res
        }
        catch(err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
      }
  

     // Make encounter
     static async makeEncounter(pid,data) {
      try{
      let res = await this.request(`patients/${pid}/encounters/add`,data, "post")
      return res.encounter
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }

    // Update encounter 
  static async updateEncounter(pid, eid, data) {
    let res = await this.request(`patients/${pid}/encounters/${eid}`, data, "patch");
    return res.encounter;
  }

  // Sign encounter 
  static async signEncounter(pid, eid, data) {
    let res = await this.request(`patients/${pid}/encounters/${eid}/sign`, data, "patch");
    return res.encounter;
  }

  // Unsign encounter
  static async unsignEncounter(pid, eid) {
    let res = await this.request(`patients/${pid}/encounters/${eid}/unsign`, {}, "patch");
    return res.encounter;
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
        // Getting encounter for a patient
        static async getPatientEncounter(pid, eid) {
          try{
          let res = await this.request(`patients/${pid}/encounters/${eid}`)
          return res.encounter
          }
          catch(err) {
              console.error("API Error:", err.response);
              let message = err.response.data.error.message;
              throw Array.isArray(message) ? message : [message];
          }
        }
 
    
     // Getting user encounters
     static async getEncounters(username) {
      try{
      let res = await this.request(`users/${username}/encounters`)
      return res.encounters
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }

      // Getting unsigned encounters
      static async getUnsignedEncounters(username) {
        try{
        let res = await this.request(`users/${username}/encounters/unsigned`)
        return res.encounters
        }
        catch(err) {
            console.error("API Error:", err.response);
            let message = err.response.data.error.message;
            throw Array.isArray(message) ? message : [message];
        }
      }

     //Delete encounter
     static async deleteEncounter(pid, eid) {
      try{
      let res = await this.request(`patients/${pid}/encounters/${eid}`,  {}, "delete")
      return res
      }
      catch(err) {
          console.error("API Error:", err.response);
          let message = err.response.data.error.message;
          throw Array.isArray(message) ? message : [message];
      }
    }



}


export default EHRApi;