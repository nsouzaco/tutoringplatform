const { admin } = require('../config/firebase');
const prisma = require('../config/prisma');

/**
 * Middleware to verify Firebase authentication token
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        tutorProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    req.firebaseUid = decodedToken.uid;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `${role} role required` });
    }

    next();
  };
};

/**
 * Middleware to check if user is either STUDENT or TUTOR (any authenticated user)
 */
const requireAuth = authenticate;

module.exports = {
  authenticate,
  requireRole,
  requireAuth,
};

