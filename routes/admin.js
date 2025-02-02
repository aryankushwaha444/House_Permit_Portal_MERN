const express = require('express');
const router = express.Router();
const Permit = require('../models/permit');
const auth = require('../middleware/auth');

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            throw new Error('Access denied. Admin only.');
        }
        next();
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
};

// Get all permits (admin only)
router.get('/permits', auth, isAdmin, async (req, res) => {
    try {
        const permits = await Permit.find({})
            .sort({ submittedDate: -1 })
            .populate('userId', 'fullName email phone');
        res.json(permits);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update permit status (admin only)
router.patch('/permits/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            throw new Error('Invalid status');
        }

        const permit = await Permit.findById(req.params.id);
        if (!permit) {
            return res.status(404).json({ error: 'Permit not found' });
        }

        permit.status = status;
        await permit.save();
        res.json(permit);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
