// Configuration for API and Socket connections
// In production (Vercel), set VITE_API_URL in your project settings to your Backend URL (e.g., https://my-backend.onrender.com)

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, '');

export default API_BASE_URL;
