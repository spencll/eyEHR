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

  //API request function 
  static async request(endpoint, data = {}, method = "get") {
    console.debug("API Call:", endpoint, data, method);

    const url = `${BASE_URL}/${endpoint}`;
  
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

  /** Get details on a company by handle. */

  static async getCompany(handle) {
    let res = await this.request(`companies/${handle}`);
    return res.company;
  }

 /** Get details on a job by title. */
  static async getJob(title) {
    let res = await this.request(`jobs/${title}`);
    return res.job;
  }

  // Get all companies /companies route
  static async getAllCompanies() {
    let res = await this.request('companies');
    return res.companies;
  }

  // Get all jobs /jobs route 
  static async getAllJobs() {
    let res = await this.request('jobs');
    return res.jobs;
  }

//   Get all users
static async getAllUsers() {
    let res = await this.request('users');
    return res.users;
  }

    // Get searched companies
    static async searchCompanies(searchData) {
        let res = await this.request('companies',searchData);
        return res.companies;
      }

        // Get searched jobs
    static async searchJobs(searchData) {
        let res = await this.request('jobs',searchData);
        return res.jobs;
      }

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

  // Register user
  static async RegisterUser(userData) {
    try{
    let res = await this.request('register',userData)
    return res
    }
    catch(err) {
        console.error("API Error:", err.response);
        let message = err.response.data.error.message;
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

    // Get logged in user info 
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
// Patch user

  static async updateProfile(username, data) {
    let res = await this.request(`users/${username}`, data, "patch");
    return res.user;
  }

  static async applyToJob(username, id) {
    await this.request(`users/${username}/jobs/${id}`, {}, "post");
  }




}


export default EHRApi;