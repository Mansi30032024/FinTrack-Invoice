const express = require('express');
const router = express.Router();
const User = require('./../models/user');
const { generateToken } = require('./../jwt');

// POST /user/signup
// Create a new user account
router.post('/signup', async (req, res) => {
  try {
    const data = req.body;

    const existingUser = await User.findOne({ email: data.email });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const newUser = new User(data);
    const savedUser = await newUser.save();

    const payload = {
      _id: savedUser._id
    };

    const token = generateToken(payload);

    console.log('User created successfully');
    res.status(200).json({
      user: {
        name: savedUser.name,
        email: savedUser.email
      },
      token
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /user/login
// Login user with email and password, then return JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      _id: user._id
    };

    const token = generateToken(payload);

    res.status(200).json({
      token,
      user: {
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
