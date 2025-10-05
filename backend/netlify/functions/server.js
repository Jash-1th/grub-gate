const serverless = require('serverless-http');
const app = require('../../server.js');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Set the execution context for Netlify
  context.callbackWaitsForEmptyEventLoop = false;
  
  const result = await handler(event, context);
  return result;
};
