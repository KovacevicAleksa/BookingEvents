/**
 * Middleware to validate request body using a Joi schema.
 * @param {Object} schema - Joi schema for validation
 * @returns {Function} Middleware function
*/

const validateRequest = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message, // Send the first validation error message
      });
    }
    next(); // Proceed to the next middleware or route handler
  };
  
  export default validateRequest;