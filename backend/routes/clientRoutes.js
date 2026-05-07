const express = require('express');
const router = express.Router();
const Client = require('./../models/client');
const { jwtAuthMiddleware } = require('./../jwt');

// POST /client
// Create a new client
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const data = req.body;
    data.createdBy = req.user._id;

    const newClient = new Client(data);
    const response = await newClient.save();

    console.log('Client added successfully');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /client
// Get all clients
router.get('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const clients = await Client.find({ createdBy: req.user._id }).sort({ createdAt: -1 });

    console.log('Clients data fetched');
    res.status(200).json(clients);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /client/:clientID
// Get one client by id
router.get('/:clientID', jwtAuthMiddleware, async (req, res) => {
  try {
    const clientID = req.params.clientID;
    const client = await Client.findOne({ _id: clientID, createdBy: req.user._id });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.status(200).json(client);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /client/:clientID
// Update client details
router.put('/:clientID', jwtAuthMiddleware, async (req, res) => {
  try {
    const clientID = req.params.clientID;
    const updatedClient = req.body;

    const response = await Client.findOneAndUpdate(
      { _id: clientID, createdBy: req.user._id },
      updatedClient,
      { new: true, runValidators: true }
    );

    if (!response) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Client updated');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /client/:clientID
// Delete a client
router.delete('/:clientID', jwtAuthMiddleware, async (req, res) => {
  try {
    const clientID = req.params.clientID;
    const response = await Client.findOneAndDelete({ _id: clientID, createdBy: req.user._id });

    if (!response) {
      return res.status(404).json({ error: 'Client not found' });
    }

    console.log('Client deleted');
    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
