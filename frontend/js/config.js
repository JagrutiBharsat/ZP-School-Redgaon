// API Configuration
// Backend deployed on Render
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://zp-school-redgaon.onrender.com/api';

const API = API_BASE_URL;
