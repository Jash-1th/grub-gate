const serverless = require('serverless-http');
const app = require('../../server.js');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Set the execution context for Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': (process.env.CORS_ORIGIN || 'https://ggc01.netlify.app').replace(/\/$/, ''),
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Credentials': 'true',
      },
      body: '',
    };
  }
  
  const result = await handler(event, context);
  
  // Add CORS headers to all responses
  if (result.headers) {
    result.headers['Access-Control-Allow-Origin'] = (process.env.CORS_ORIGIN || 'https://ggc01.netlify.app').replace(/\/$/, '');
    result.headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  return result;
};
