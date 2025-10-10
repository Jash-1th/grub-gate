const serverless = require('serverless-http');
const app = require('../../server.js');

const handler = serverless(app);

// Helper function to get the appropriate CORS origin
function getCorsOrigin(requestOrigin) {
  const allowedOrigins = [
    'https://gg0c1.netlify.app', // Customer App
    'https://gg0p1.netlify.app', // Partner Portal
    'http://localhost:3000',     // Local Customer App
    'http://localhost:5173',     // Local Partner Portal
    'http://localhost:4173'      // Local Partner Portal Preview
  ];
  
  // Add origins from environment variable
  if (process.env.CORS_ORIGIN) {
    const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
    allowedOrigins.push(...envOrigins);
  }
  
  // Return the requesting origin if it's allowed, otherwise return the first allowed origin
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  return allowedOrigins[0]; // Default to customer app
}

module.exports.handler = async (event, context) => {
  // Set the execution context for Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  const requestOrigin = event.headers.origin || event.headers.Origin;
  const corsOrigin = getCorsOrigin(requestOrigin);
  
  console.log('🌐 CORS Request - Origin:', requestOrigin, 'Allowed:', corsOrigin);
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
      },
      body: '',
    };
  }
  
  try {
    const result = await handler(event, context);
    
    // Add CORS headers to all responses
    if (result.headers) {
      result.headers['Access-Control-Allow-Origin'] = corsOrigin;
      result.headers['Access-Control-Allow-Credentials'] = 'true';
      result.headers['Vary'] = 'Origin';
    }
    
    return result;
  } catch (error) {
    console.error('❌ Backend function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Credentials': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      }),
    };
  }
};
