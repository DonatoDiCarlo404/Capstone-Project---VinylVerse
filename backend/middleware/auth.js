const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Accesso negato' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id, // Mi aspetto che il token contenga un campo id
      username: decoded.username
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token non valido' });
  }
};

module.exports = auth;