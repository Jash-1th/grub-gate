import React from 'react';
import { getFirebaseConfig, getEmailJsConfig } from '../../config/env';

const EnvDebug = () => {
  const firebaseConfig = getFirebaseConfig();
  const emailJsConfig = getEmailJsConfig();
  
  // Check if running in browser
  const isBrowser = typeof window !== 'undefined';
  
  // Get all environment variables
  const envVars = Object.entries(import.meta.env)
    .filter(([key]) => key.startsWith('VITE_'))
    .map(([key, value]) => ({
      key,
      value: key.includes('KEY') || key.includes('SECRET') || key.includes('PASSWORD')
        ? '•••••' + (value ? value.slice(-4) : '')
        : value
    }));

  return (
    <div className="p-4 bg-gray-100 rounded-lg my-4">
      <h2 className="text-lg font-bold mb-2">Environment Debug</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Firebase Config:</h3>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(firebaseConfig, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-1">EmailJS Config:</h3>
        <pre className="text-xs bg-white p-2 rounded overflow-auto">
          {JSON.stringify(emailJsConfig, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3 className="font-semibold mb-1">Loaded Environment Variables:</h3>
        <div className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="p-1">Variable</th>
                <th className="p-1">Value</th>
              </tr>
            </thead>
            <tbody>
              {envVars.map(({ key, value }) => (
                <tr key={key} className="border-b">
                  <td className="p-1 font-mono">{key}</td>
                  <td className="p-1 font-mono">{String(value)}</td>
                </tr>
              ))}
              {envVars.length === 0 && (
                <tr>
                  <td colSpan="2" className="p-2 text-center text-gray-500">
                    No environment variables found with VITE_ prefix
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Note:</strong> Sensitive values are partially hidden for security.</p>
        <p>Running in: {isBrowser ? 'Browser' : 'Server'}</p>
      </div>
    </div>
  );
};

export default EnvDebug;
