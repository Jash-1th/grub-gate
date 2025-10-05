// FILE: src/utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      id: userId,
      role: role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
};

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} Refresh token
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token
 * @returns {object} Decoded token payload
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
};

/**
 * Decode token without verification (for expired tokens)
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const decodeToken = (token) => {
  return jwt.decode(token);
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date} Expiration date
 */
const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  return new Date(decoded.exp * 1000);
};

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if expired
 */
const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return expiration < new Date();
  } catch (error) {
    return true;
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {string} userId - User ID
 * @param {string} role - User role
 * @returns {object} Token pair
 */
const generateTokenPair = (userId, role) => {
  return {
    accessToken: generateToken(userId, role),
    refreshToken: generateRefreshToken(userId),
    expiresIn: process.env.JWT_EXPIRE || '7d'
  };
};

module.exports = {
  generateToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  generateTokenPair
};
