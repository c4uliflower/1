import axios from "axios";

// Create an axios instance with default configuration for API requests
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
  },
});

export default api; 