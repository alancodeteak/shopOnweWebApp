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
    const response = await axios.post(
      'https://yaadro.com/api/shopowner/auth/login', // <-- your real backend login endpoint
      body,
      {
        headers: {
          'x-api-key': process.env.ADMIN_KEY, // <-- secret from Netlify env vars
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