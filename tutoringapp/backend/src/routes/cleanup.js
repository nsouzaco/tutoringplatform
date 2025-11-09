const express = require('express');
const router = express.Router();
const { admin } = require('../config/firebase');
const prisma = require('../config/prisma');

// WARNING: This is a development-only endpoint for cleaning up test data
// Remove this in production!

// Delete a user from both Firebase and Database
router.delete('/user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'This endpoint is disabled in production' });
    }

    let results = {
      firebaseDeleted: false,
      databaseDeleted: false,
      message: ''
    };

    // Try to delete from Firebase Auth
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().deleteUser(userRecord.uid);
      results.firebaseDeleted = true;
      results.message += `Deleted from Firebase Auth (UID: ${userRecord.uid}). `;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        results.message += 'User not found in Firebase Auth. ';
      } else {
        throw error;
      }
    }

    // Try to delete from Database
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email }
      });
      
      if (dbUser) {
        await prisma.user.delete({
          where: { email }
        });
        results.databaseDeleted = true;
        results.message += 'Deleted from database. ';
      } else {
        results.message += 'User not found in database. ';
      }
    } catch (error) {
      results.message += `Database error: ${error.message}. `;
    }

    res.json(results);
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete all users (use with extreme caution!)
router.delete('/all-users', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'This endpoint is disabled in production' });
    }

    let results = {
      firebaseDeleted: 0,
      databaseDeleted: 0,
      errors: []
    };

    // Delete all from database first
    const dbUsers = await prisma.user.findMany();
    results.databaseDeleted = dbUsers.length;
    await prisma.user.deleteMany();

    // Delete all from Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    for (const userRecord of listUsersResult.users) {
      try {
        await admin.auth().deleteUser(userRecord.uid);
        results.firebaseDeleted++;
      } catch (error) {
        results.errors.push(`Failed to delete ${userRecord.email}: ${error.message}`);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Cleanup error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;



