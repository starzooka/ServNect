// routes/users.js
import express from 'express';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';

const router = express.Router();

// GET /users  (get all users)
router.get('/', async (req, res) => {
  try {
    const users = await db.collection('users').find().toArray();

    const sanitized = users.map(({ _id, password, ...rest }) => ({
      id: _id.toString(),
      ...rest,
    }));

    return res.status(200).json(sanitized);
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /users/:id  (get user by id)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    let user;
    try {
      user = await db
        .collection('users')
        .findOne({ _id: new ObjectId(String(id)) });
    } catch (e) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, _id, ...rest } = user;

    return res.status(200).json({
      id: _id.toString(),
      ...rest,
    });
  } catch (err) {
    console.error('getUserById error:', err);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /me  (current logged-in user)
router.get('/me/current', (req, res) => {
  // authMiddleware already attached req.user
  if (!req.user) {
    return res.status(200).json(null);
  }
  return res.status(200).json(req.user);
});

export default router;
