// API Configuration
// IMPORTANT: After deploying backend to Render, replace the URL below
// Example: 'https://zp-school-backend.onrender.com/api'
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : 'https://your-render-backend.onrender.com/api'; // UPDATE THIS AFTER BACKEND DEPLOYMENT

const API = API_BASE_URL;
