const sendSuccess = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && (typeof data === 'object' && !Array.isArray(data) ? data : { data })),
    ...(meta && { meta })
  };

  return res.status(statusCode).json(response);
};

const sendError = (res, message = 'An error occurred', statusCode = 500, details = null) => {
  const response = {
    success: false,
    message,
    ...(details && { details })
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError
};
