// FILE: src/utils/apiResponse.js

/**
 * Standardized API response utility functions
 */

// Success response
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    status: 'success',
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

// Error response
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    status: 'error',
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Paginated response
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    status: 'success',
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1
    }
  });
};

// Created response
const createdResponse = (res, data, message = 'Resource created successfully') => {
  return successResponse(res, data, message, 201);
};

// No content response
const noContentResponse = (res, message = 'Operation completed successfully') => {
  return res.status(204).json({
    status: 'success',
    message
  });
};

// Not found response
const notFoundResponse = (res, message = 'Resource not found') => {
  return errorResponse(res, message, 404);
};

// Validation error response
const validationErrorResponse = (res, errors, message = 'Validation failed') => {
  return errorResponse(res, message, 400, errors);
};

// Unauthorized response
const unauthorizedResponse = (res, message = 'Unauthorized access') => {
  return errorResponse(res, message, 401);
};

// Forbidden response
const forbiddenResponse = (res, message = 'Access forbidden') => {
  return errorResponse(res, message, 403);
};

// Conflict response
const conflictResponse = (res, message = 'Resource conflict') => {
  return errorResponse(res, message, 409);
};

// Too many requests response
const tooManyRequestsResponse = (res, message = 'Too many requests') => {
  return errorResponse(res, message, 429);
};

// Internal server error response
const internalServerErrorResponse = (res, message = 'Internal server error') => {
  return errorResponse(res, message, 500);
};

// Service unavailable response
const serviceUnavailableResponse = (res, message = 'Service temporarily unavailable') => {
  return errorResponse(res, message, 503);
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  tooManyRequestsResponse,
  internalServerErrorResponse,
  serviceUnavailableResponse
};
