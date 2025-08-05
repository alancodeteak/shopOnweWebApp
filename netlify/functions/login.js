const axios = require('axios');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse the login payload from the frontend
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  try {
    // Forward the login request to your real backend, adding the secret header
    const backendUrl = process.env.BACKEND_LOGIN_URL || 'https://example.com/api/login'; // Use env var or placeholder
    const apiKey = process.env.ADMIN_KEY || 'demo-key'; // Use env var or placeholder
    const response = await axios.post(
      backendUrl,
      body,
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        }
      }
    );

    return {
      statusCode: response.status,
      body: JSON.stringify(response.data),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (error) {
    return {
      statusCode: error.response?.status || 500,
      body: JSON.stringify({ error: error.message, details: error.response?.data }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};